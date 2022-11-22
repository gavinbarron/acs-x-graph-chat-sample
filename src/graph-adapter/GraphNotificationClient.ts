import * as signalR from "@microsoft/signalr";
import { gnbProvider } from "../index";
import { graphChatMessageToACSChatMessage } from "./GraphAcsInteropUtils";
import { ThreadEventEmitter } from "./ThreadEventEmitter";

const appSettings = {
  functionHost: "https://gnbmgtacsfunc.azurewebsites.net", // TODO: improve how this is loaded
  defaultSubscriptionLifetimeInMinutes: 5,
  renewalThreshold: 45, //The number of seconds before subscription expires it will be renewed
  timerInterval: 10, //The number of seconds the timer will check on expiration
};

const SubscriptionMethods = {
  Create: "CreateSubscription",
  Renew: "RenewSubscription",
};

const ReturnMethods = {
  NewMessage: "newMessage",
  SubscriptionCreated: "SubscriptionCreated",
  SubscriptionRenewed: "SubscriptionRenewed",
  SubscriptionRenewalFailed: "SubscriptionRenewalFailed",
  SubscriptionCreationFailed: "SubscriptionCreationFailed",
  SubscriptionRenewalIgnored: "SubscriptionRenewalIgnored",
};

type ChangeTypes = "created" | "updated" | "deleted";

type SubscriptionDefinition = {
  resource: string;
  expirationTime: Date; // ISO 8601 format
  changeTypes: ChangeTypes[];
  resourceData: boolean;
  signalRConnectionId: string | null;
};

type Notification = {
  subscriptionId: string;
  encryptedContent: string;
};

type Subscription = {
  userId: string;
  subscriptionId: string;
  expirationTime: string; // ISO 8601
  resource: string;
};

type SubscriptionRecord = {
  UserId: string;
  Id: string;
  ExpirationTime: string; // ISO 8601
  GraphResource: string;
};

const loadCachedSubscriptions = (): Subscription[] =>
  JSON.parse(sessionStorage.getItem("graph-subscriptions") || "[]");
export class GraphNotificationClient {
  private connection?: signalR.HubConnection = undefined;
  private renewalInterval = -1;
  private renewalCount = 0;

  private subscriptionEmitter: Record<string, ThreadEventEmitter> = {};
  private tempThreadSubscriptionEmitterMap: Record<string, ThreadEventEmitter> =
    {};

  private getToken() {
    return gnbProvider.getAccessToken();
  }

  async createSignalConnection() {
    const token = await this.getToken();
    if (!token) {
      throw new Error("Could not get access token");
    }

    const connection = this.buildConnection();

    connection.onreconnected(this.onReconnect);

    connection.on(ReturnMethods.NewMessage, this.receiveNewMessage);

    connection.on("EchoMessage", console.log);

    connection.on(ReturnMethods.SubscriptionCreated, this.onSubscribed);

    connection.on(ReturnMethods.SubscriptionRenewed, this.onRenewed);

    connection.on(
      ReturnMethods.SubscriptionRenewalIgnored,
      this.onRenewalIgnored
    );

    connection.on(
      ReturnMethods.SubscriptionRenewalFailed,
      this.onRenewalFailed
    );

    connection.on(
      ReturnMethods.SubscriptionCreationFailed,
      this.onSubscribeFailed
    );

    this.connection = connection;

    await connection.start();
    console.log(connection);
  }

  private onRenewalIgnored = (subscriptionRecord: SubscriptionRecord) => {
    console.log(
      "subscription renewalIgnored for subscription " + subscriptionRecord.Id
    );
  };

  private onRenewalFailed = (subscriptionId: string) => {
    console.log(`Renewal of subscription ${subscriptionId} failed.`);
    //Something failed to renew the subscription. Might be already deleted
    //ToDo: Consider instead of remove subscription create new one.
    this.removeSubscription(subscriptionId);
  };

  private onSubscribeFailed = (
    subscriptionDefinition: SubscriptionDefinition
  ) => {
    //Something failed when creation the subscription.
    console.log(
      `Creation of subscription for resource ${subscriptionDefinition.resource} failed.`
    );
  };

  private buildConnection() {
    return new signalR.HubConnectionBuilder()
      .withUrl(appSettings.functionHost + "/api", {
        accessTokenFactory: async () => await this.getToken(),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  private onReconnect = (connectionId: string | undefined) => {
    console.log(`Reconnected. ConnectionId: ${connectionId}`);
    this.renewChatSubscriptions();
  };

  private receiveNewMessage = async (notification: Notification) => {
    console.log("received new message");
    if (!notification.encryptedContent)
      throw new Error("Message did not contain encrypted content");

    const decryptedContent = await this.decryptChatMessageFromNotification(
      notification
    );
    const message = graphChatMessageToACSChatMessage(decryptedContent);

    const emitter: ThreadEventEmitter =
      this.subscriptionEmitter[notification.subscriptionId];
    emitter.chatMessageReceived({
      message: message.content?.message!,
      metadata: {},
      id: message.id,
      createdOn: message.createdOn,
      version: message.version,
      type: message.type,
      threadId: decryptedContent.chatId,
      sender: message.sender!,
      senderDisplayName: message.senderDisplayName!,
      recipient: { id: "who knows again", kind: "unknown" },
    });
  };

  private onSubscribed = async (subscriptionRecord: SubscriptionRecord) => {
    console.log(
      `Subscription created. SubscriptionId: ${subscriptionRecord.Id}`
    );
    this.cacheSubscription(subscriptionRecord);
  };

  private onRenewed = async (subscriptionRecord: SubscriptionRecord) => {
    console.log(
      `Subscription renewed. SubscriptionId: ${subscriptionRecord.Id}`
    );
    this.cacheSubscription(subscriptionRecord);
  };

  private cacheSubscription = (subscriptionRecord: SubscriptionRecord) => {
    console.log(subscriptionRecord);

    // move the event emitter from the temp map to the subscription map
    this.remapEmitter(subscriptionRecord);

    const subscriptions = loadCachedSubscriptions();
    const tempSubscriptions: Subscription[] = subscriptions
      ? subscriptions.filter(
          (subscription) =>
            subscription.subscriptionId !== subscriptionRecord.Id
        )
      : [];

    tempSubscriptions.push({
      userId: subscriptionRecord.UserId,
      subscriptionId: subscriptionRecord.Id,
      expirationTime: subscriptionRecord.ExpirationTime,
      resource: subscriptionRecord.GraphResource,
    });

    sessionStorage.setItem(
      "graph-subscriptions",
      JSON.stringify(tempSubscriptions)
    );

    //only start timer once. -1 for renewaltimer is semaphore it has stopped.
    if (this.renewalInterval === -1) this.startRenewalTimer();
  };

  private remapEmitter(subscriptionRecord: SubscriptionRecord) {
    if (
      this.tempThreadSubscriptionEmitterMap[subscriptionRecord.GraphResource]
    ) {
      this.subscriptionEmitter[subscriptionRecord.Id] =
        this.tempThreadSubscriptionEmitterMap[subscriptionRecord.GraphResource];
      delete this.tempThreadSubscriptionEmitterMap[
        subscriptionRecord.GraphResource
      ];
    }
  }

  public async subscribeToChatNotifications(
    threadId: string,
    eventEmitter: ThreadEventEmitter
  ) {
    if (!this.connection) {
      console.log("No connection");
      return;
    }
    const token = await this.getToken();
    if (!token) {
      throw new Error("Could not retrieve token for user");
    }

    console.log("subscribing to chat notifications for thread " + threadId);

    const resourcePath = `chats/${threadId}/messages`;

    const expirationTime: Date = new Date(
      new Date().getTime() +
        appSettings.defaultSubscriptionLifetimeInMinutes * 60 * 1000
    );

    const subscriptionDefinition: SubscriptionDefinition = {
      resource: resourcePath,
      expirationTime: expirationTime,
      changeTypes: ["created", "updated", "deleted"],
      resourceData: true,
      signalRConnectionId: this.connection.connectionId,
    };

    // put the eventEmitter into a temporary map so that we can retrieve it when the subscription is created
    this.tempThreadSubscriptionEmitterMap[resourcePath] = eventEmitter;

    await this.connection.send(
      SubscriptionMethods.Create,
      subscriptionDefinition,
      token
    );

    console.log("Invoked CreateSubscription");
  }

  private startRenewalTimer = () => {
    if (this.renewalInterval !== -1) clearInterval(this.renewalInterval);
    this.renewalInterval = window.setInterval(
      () => this.renewalTimer(),
      appSettings.timerInterval * 1000
    );
    console.log(`Start renewal timer . Id: ${this.renewalInterval}`);
  }

  private renewalTimer = () => {
    const subscriptions = loadCachedSubscriptions();
    if (subscriptions.length === 0) {
      console.log(
        `No subscriptions found in session state. Stop renewal timer ${this.renewalInterval}.`
      );
      clearInterval(this.renewalInterval);
      return;
    }

    for (const subscription of subscriptions) {
      const expirationTime = new Date(subscription.expirationTime);
      const now = new Date();
      var diff = Math.round((expirationTime.getTime() - now.getTime()) / 1000);

      if (diff <= appSettings.renewalThreshold) {
        this.renewalCount++;
        console.log(
          `Renewing Graph subscription. RenewalCount: ${this.renewalCount}`
        );
        //stop interval to prevent new invokes untill refresh is ready.
        clearInterval(this.renewalCount);
        this.renewalInterval = -1;
        this.renewChatSubscriptions();
        //There is one subscription that need expiration, all subscriptions will be renewed
        break;
      }
    }
  }

  public renewChatSubscriptions = async () => {
    if (!this.connection) {
      throw new Error("No connection");
    }
    clearInterval(this.renewalInterval);
    const token = await this.getToken();
    if (!token) {
      throw new Error("Could not retrieve token for user");
    }

    let expirationTime = new Date(
      new Date().getTime() +
        appSettings.defaultSubscriptionLifetimeInMinutes * 60 * 1000
    );

    const subscriptionCache = loadCachedSubscriptions();
    const awaits: Promise<void>[] = [];
    for (const subscription of subscriptionCache) {
      awaits.push(
        this.connection?.send(
          SubscriptionMethods.Renew,
          subscription.subscriptionId,
          expirationTime,
          token
        )
      );
      console.log(`Invoked RenewSubscription ${subscription.subscriptionId}`);
    }
    await Promise.all(awaits);
  }

  private removeSubscription = (subscriptionId: string) => {
    console.log("Remove Subscription from session storage.");
    const subscriptionCache = loadCachedSubscriptions();
    if (subscriptionCache?.length > 0) {
      let subscriptions = subscriptionCache.filter((subscription) => {
        return subscription.subscriptionId !== subscriptionId;
      });

      sessionStorage.setItem(
        "graph-subscriptions",
        JSON.stringify(subscriptions)
      );
    }
  };

  private decryptChatMessageFromNotification = async (
    notification: Notification
  ) => {
    const token = await this.getToken();
    if (!token) {
      throw new Error("Could not retrieve token for user");
    }

    const response = await fetch(
      appSettings.functionHost + "/api/GetChatMessageFromNotification",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(notification.encryptedContent),
      }
    );

    if (response.ok) {
      return await response.json();
    }
  };
}