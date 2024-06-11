import {useRef} from 'react';
import * as Pusher from '@libs/Pusher/pusher';
import * as Report from '@userActions/Report';
import type {ReportPusherSubscriptionManager, ReportSubscribeFunction} from './types';

const reportScreenPusherEventSubscriptionMap: Record<string, Omit<ReportPusherSubscriptionManager, 'eventName'>> = {
    [Pusher.TYPE.USER_IS_TYPING]: {
        subscribe: Report.subscribeToReportTypingEvents,
        unsubscribe: Report.unsubscribeFromReportChannel,
    },
    [Pusher.TYPE.USER_IS_LEAVING_ROOM]: {
        subscribe: Report.subscribeToReportLeavingEvents,
        unsubscribe: Report.unsubscribeFromLeavingRoomReportChannel,
    },
};

const useReportPusherEventSubscription = (): Map<string, ReportPusherSubscriptionManager> => {
    const didSubscribedMapRef = useRef<Record<string, boolean>>(Object.fromEntries(Object.keys(reportScreenPusherEventSubscriptionMap).map((eventName) => [eventName, false])));

    const createSubscriptionFunctionRef = useRef(
        (eventName: string, fn: ReportSubscribeFunction, isForSubscribed = true): ReportSubscribeFunction =>
            (reportID: string, ...args: unknown[]) => {
                // if the subscription state is already in the desired state (i.e try to subscribe or resubscribe again => return early)
                if (!!didSubscribedMapRef.current[eventName] === !!isForSubscribed) {
                    return;
                }

                didSubscribedMapRef.current[eventName] = !!isForSubscribed;
                fn(reportID, ...args);
            },
    );

    const reportSubscriptionManagerMapRef = useRef<Map<string, ReportPusherSubscriptionManager>>(
        new Map(
            Object.entries(reportScreenPusherEventSubscriptionMap).map(([eventName, {subscribe, unsubscribe}]) => [
                eventName,
                {
                    eventName,
                    subscribe: createSubscriptionFunctionRef.current(eventName, subscribe, true),
                    unsubscribe: createSubscriptionFunctionRef.current(eventName, unsubscribe, false),
                },
            ]),
        ),
    );

    return reportSubscriptionManagerMapRef.current;
};

export default useReportPusherEventSubscription;
