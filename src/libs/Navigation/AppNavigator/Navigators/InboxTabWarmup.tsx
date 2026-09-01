import useOnyx from '@hooks/useOnyx';

import {getIsInboxTabPreloaded, markInboxTabPreloaded, resetInboxTabPreloaded} from '@libs/Navigation/inboxTabPreloadState';
import {Scheduler} from '@libs/Scheduler';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';

import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';

import {useEffect} from 'react';

type InboxTabWarmupProps = Pick<BottomTabBarProps, 'navigation'>;

/**
 * Preloads the lazy Reports tab in the first idle window after OpenApp, so the first Inbox tap runs the warm path.
 * Rendered by the tab bar because that is where the tab navigator's own navigation object lives, and its router is
 * the one that handles the preload action.
 */
function InboxTabWarmup({navigation}: InboxTabWarmupProps) {
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    useEffect(() => {
        // `undefined` means Onyx has not read the key yet, so wait for an explicit false instead of negating.
        if (isLoadingApp !== false || getIsInboxTabPreloaded()) {
            return;
        }

        const task = Scheduler.scheduleWhenIdle(() => {
            if (getIsInboxTabPreloaded()) {
                return;
            }

            const tabState = navigation.getState();

            // Preloading the focused tab pins its key in `preloadedRouteKeys` and drops `shouldFreeze`, so it would
            // defeat `freezeOnBlur` until the user next opens Inbox. Reachable because the tab is lazy, so a launch
            // straight into a report has no nested state yet.
            if (tabState.routes.at(tabState.index)?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                return;
            }

            const reportsSplitRoute = tabState.routes.find((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);

            // Preloading an already-mounted scene still adds its key to `preloadedRouteKeys` and unfreezes what
            // react-freeze parked, despite the docs calling it a no-op.
            if (!reportsSplitRoute || reportsSplitRoute.state) {
                return;
            }

            navigation.preload(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
            markInboxTabPreloaded();
        });

        return () => task.cancel();
    }, [isLoadingApp, navigation]);

    // Unmount-only, so it survives the effect above re-running.
    useEffect(() => resetInboxTabPreloaded, []);

    return null;
}

export default InboxTabWarmup;
