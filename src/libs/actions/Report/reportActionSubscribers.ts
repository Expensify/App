/**
 * Subscriber registry for new report actions, kept out of the Report hub so callers can notify without importing it.
 */
import type ReportAction from '@src/types/onyx/ReportAction';

type SubscriberCallback = (isFromCurrentUser: boolean, reportAction: ReportAction | undefined) => void;

type ActionSubscriber = {
    reportID: string;
    callback: SubscriberCallback;
};

// New action subscriber array for report pages
let newActionSubscribers: ActionSubscriber[] = [];

/**
 * Enables the Report actions file to let the ReportActionsList know that a new comment has arrived in realtime for the current report
 * Add subscriber for report id
 * @returns Remove subscriber for report id
 */
function subscribeToNewActionEvent(reportID: string, callback: SubscriberCallback): () => void {
    newActionSubscribers.push({callback, reportID});
    return () => {
        newActionSubscribers = newActionSubscribers.filter((subscriber) => subscriber.reportID !== reportID);
    };
}

/** Notify the ReportActionsList that a new comment has arrived */
function notifyNewAction(reportID: string | string[] | undefined, reportAction: ReportAction | undefined, isFromCurrentUser: boolean) {
    if (!reportID) {
        return;
    }
    const ids = Array.isArray(reportID) ? reportID : [reportID];
    for (const id of ids) {
        const actionSubscriber = newActionSubscribers.find((subscriber) => subscriber.reportID === id);
        if (actionSubscriber) {
            actionSubscriber.callback(isFromCurrentUser, reportAction);
        }
    }
}

export {subscribeToNewActionEvent, notifyNewAction};
