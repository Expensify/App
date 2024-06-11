type ReportSubscribeFunction = (reportID: string, ...args: unknown[]) => void;

type ReportPusherSubscriptionManager = {
    eventName: string;
    subscribe: ReportSubscribeFunction;
    unsubscribe: ReportSubscribeFunction;
};

export type {ReportPusherSubscriptionManager, ReportSubscribeFunction};
