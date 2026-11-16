import Navigation from '@libs/Navigation/Navigation';
import {getAuthToken} from '@libs/Network/NetworkStore';
import {getDBTimeWithSkew} from '@libs/NetworkState';
import {Scheduler} from '@libs/Scheduler';
import type {IdleTask} from '@libs/Scheduler';

import {readNewestAction} from '@userActions/Report';

import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

import useIsInPreloadedTab from './useIsInPreloadedTab';
import usePrevious from './usePrevious';

type PendingRead = {
    task: IdleTask;
    read: () => void;
};

function cancelIdleRead(pendingRead: PendingRead | null) {
    if (!pendingRead) {
        return;
    }
    pendingRead.task.cancel();
}

/** Holds the read of a report revealed by the Inbox tab tap until idle, so the LHN re-sort it triggers misses that tap's first paint. */
function useMarkReadAfterReveal(reportID: string, lastReadTime: string | undefined) {
    const isInPreloadedTab = useIsInPreloadedTab();
    const wasInPreloadedTab = usePrevious(isInPreloadedTab);
    const isRevealRender = wasInPreloadedTab && !isInPreloadedTab;
    const pendingRead = useRef<PendingRead | null>(null);
    const latestLastReadTime = useRef(lastReadTime);
    useEffect(() => {
        latestLastReadTime.current = lastReadTime;
    }, [lastReadTime]);

    // The held read must not undo a mark-as-unread made while it waits.
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, () => {
            cancelIdleRead(pendingRead.current);
            pendingRead.current = null;
        });
        return () => subscription.remove();
    }, [reportID]);

    // Leaving the report early still marks it read, like an immediate read would.
    useEffect(
        () => () => {
            const pending = pendingRead.current;
            pendingRead.current = null;
            cancelIdleRead(pending);
            // Sign-out unmounts the report after clearing its data, so no read may be queued then.
            if (!getAuthToken()) {
                return;
            }
            pending?.read();
        },
        [reportID],
    );

    /** Called before any other read, so the held read's older time can't overwrite it. */
    const cancelPendingRead = () => {
        cancelIdleRead(pendingRead.current);
        pendingRead.current = null;
    };

    const markRead = (isReportActionsLoaded: boolean) => {
        // A wide submit pre-mount uses the same preloaded flag, but its reveal isn't the Inbox tap.
        if (!isRevealRender || Navigation.getIsRevealingPreMountedFullscreen()) {
            cancelPendingRead();
            readNewestAction(reportID, isReportActionsLoaded);
            return;
        }

        // Both mark-as-read passes react to the same reveal, and one read covers them.
        if (pendingRead.current) {
            return;
        }
        const readTime = getDBTimeWithSkew();
        const revealLastReadTime = latestLastReadTime.current;
        const read = () => {
            // Any change to the read time since the reveal wins, including an unread synced from another tab.
            if (latestLastReadTime.current !== revealLastReadTime) {
                return;
            }
            readNewestAction(reportID, isReportActionsLoaded, false, readTime);
        };
        const task = Scheduler.scheduleWhenIdle(() => {
            pendingRead.current = null;
            read();
        });
        pendingRead.current = {task, read};
    };

    return {markRead, cancelPendingRead};
}

export default useMarkReadAfterReveal;
