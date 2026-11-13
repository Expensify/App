import Navigation from '@libs/Navigation/Navigation';
import {getDBTimeWithSkew} from '@libs/NetworkState';

import {readNewestAction} from '@userActions/Report';

import {useEffect, useRef} from 'react';
import {DeviceEventEmitter} from 'react-native';

import useIsInPreloadedTab from './useIsInPreloadedTab';
import usePrevious from './usePrevious';

// Upper bound on how long a read held from a reveal can wait for an idle main thread.
const READ_AFTER_REVEAL_TIMEOUT_MS = 1000;

type PendingRead = {
    idleCallbackID: number;
    read: () => void;
};

function cancelIdleRead(pendingRead: PendingRead | null) {
    if (!pendingRead) {
        return;
    }
    cancelIdleCallback(pendingRead.idleCallbackID);
}

/**
 * Marks a report read, and holds the read until the main thread is idle when this render reveals the report from the
 * preloaded Inbox tab.
 *
 * Revealing the preloaded tab is the tap that has to paint the sidebar. Marking read in that commit recomputes derived
 * report data and re-sorts the LHN before the sidebar's first layout, so the read waits until the reveal has painted. It
 * keeps the reveal time, so messages that arrive while it waits stay unread, as they would with an immediate read, and it
 * is skipped when something else already moved the report's read time past it.
 */
function useMarkReadAfterReveal(reportID: string, lastReadTime: string | undefined) {
    const isInPreloadedTab = useIsInPreloadedTab();
    const wasInPreloadedTab = usePrevious(isInPreloadedTab);
    const isRevealRender = wasInPreloadedTab && !isInPreloadedTab;
    const pendingRead = useRef<PendingRead | null>(null);
    const latestLastReadTime = useRef(lastReadTime);
    useEffect(() => {
        latestLastReadTime.current = lastReadTime;
    }, [lastReadTime]);

    // A mark-as-unread made before the held read runs must not be undone by it.
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(`unreadAction_${reportID}`, () => {
            cancelIdleRead(pendingRead.current);
            pendingRead.current = null;
        });
        return () => subscription.remove();
    }, [reportID]);

    // Leaving or switching the report before the held read runs still marks it read, as an immediate read would have.
    useEffect(
        () => () => {
            const pending = pendingRead.current;
            pendingRead.current = null;
            cancelIdleRead(pending);
            pending?.read();
        },
        [reportID],
    );

    /** Drops a held read, so its older reveal time cannot overwrite a read that runs before it. */
    const cancelPendingRead = () => {
        cancelIdleRead(pendingRead.current);
        pendingRead.current = null;
    };

    const markRead = (isReportActionsLoaded: boolean) => {
        // A wide submit pre-mount is held by the same preloaded-tab flag, but its reveal is not the Inbox tap, so it reads as before.
        if (!isRevealRender || Navigation.getIsRevealingPreMountedFullscreen()) {
            cancelPendingRead();
            readNewestAction(reportID, isReportActionsLoaded);
            return;
        }

        // More than one mark-as-read pass reacts to the same reveal, and one read covers them all.
        if (pendingRead.current) {
            return;
        }
        const readTime = getDBTimeWithSkew();
        const read = () => {
            // A comment, an expense or a manual Mark as read since the reveal already moved the read time past it.
            if ((latestLastReadTime.current ?? '') >= readTime) {
                return;
            }
            readNewestAction(reportID, isReportActionsLoaded, false, readTime);
        };
        const idleCallbackID = requestIdleCallback(
            () => {
                pendingRead.current = null;
                read();
            },
            {timeout: READ_AFTER_REVEAL_TIMEOUT_MS},
        );
        pendingRead.current = {idleCallbackID, read};
    };

    return {markRead, cancelPendingRead};
}

export default useMarkReadAfterReveal;
