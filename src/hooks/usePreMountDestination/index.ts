import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {Scheduler} from '@libs/Scheduler';
import type {IdleTask} from '@libs/Scheduler';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

import {useEffect, useRef} from 'react';

import type {AfterTransition, UsePreMountDestinationOptions, UsePreMountDestinationResult} from './types';

const PRE_INSERT_OPEN_TRANSITION_START_WAIT_MS = 500;

type TransitionCancelHandle = {
    cancel: () => void;
};

/**
 * Pre-mounts a fullscreen destination behind an open RHP so modal dismissal reveals an already-rendered screen.
 *
 * Use this for RHP-to-fullscreen flows where the destination route is known at mount time. For flows that
 * start on narrow layout, pre-insert is scheduled after the RHP open transition. Without pre-mounting,
 * dismiss creates a visible gap (narrow) or flashes the previous page (wide) while React mounts the destination tree.
 */
function usePreMountDestination(route: Route | undefined, options?: UsePreMountDestinationOptions): UsePreMountDestinationResult {
    const {narrowDestinationStrategy = CONST.NARROW_DESTINATION_STRATEGY.PRE_INSERT, shouldPreservePreInsertedRouteOnUnmount} = options ?? {};

    const preInsertTaskRef = useRef<IdleTask | undefined>(undefined);
    const transitionCancelHandleRef = useRef<TransitionCancelHandle | undefined>(undefined);
    const hasRevealBeenCalledRef = useRef(false);
    const preInsertedRouteRef = useRef<Route | undefined>(undefined);
    const shouldPreservePreInsertedRouteOnUnmountRef = useRef(shouldPreservePreInsertedRouteOnUnmount);

    function cancelPreInsert() {
        transitionCancelHandleRef.current?.cancel();
        transitionCancelHandleRef.current = undefined;
        preInsertTaskRef.current?.cancel();
        preInsertTaskRef.current = undefined;
    }

    function removePreInsertedRouteIfNeeded() {
        if (!preInsertedRouteRef.current) {
            return;
        }

        if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            Navigation.removePreInsertedFullscreenIfNeeded();
        }

        preInsertedRouteRef.current = undefined;
    }

    function runPreInsert(routeToPreInsert: Route) {
        preInsertTaskRef.current = undefined;

        if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            return;
        }

        Navigation.preInsertFullscreenUnderRHP(routeToPreInsert);

        if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            preInsertedRouteRef.current = routeToPreInsert;
        }
    }

    function revealDestination(afterTransition?: AfterTransition) {
        hasRevealBeenCalledRef.current = true;
        cancelPreInsert();

        if (route && preInsertedRouteRef.current === route && Navigation.getIsFullscreenPreInsertedUnderRHP()) {
            Navigation.clearFullscreenPreInsertedFlag();
            preInsertedRouteRef.current = undefined;
            Navigation.dismissModal({afterTransition});
            return;
        }

        if (!route) {
            Navigation.dismissModal({afterTransition});
            return;
        }

        if (afterTransition) {
            Navigation.revealRouteBeforeDismissingModal(route, {afterTransition});
            return;
        }

        Navigation.revealRouteBeforeDismissingModal(route);
    }

    function cleanupPreMount() {
        cancelPreInsert();
        removePreInsertedRouteIfNeeded();
    }

    // Keep this passive so route-change cleanup reads the preserve callback from the route being cleaned up.
    useEffect(() => {
        shouldPreservePreInsertedRouteOnUnmountRef.current = shouldPreservePreInsertedRouteOnUnmount;
    }, [shouldPreservePreInsertedRouteOnUnmount]);

    useEffect(() => {
        hasRevealBeenCalledRef.current = false;

        return () => {
            cancelPreInsert();

            if (hasRevealBeenCalledRef.current || shouldPreservePreInsertedRouteOnUnmountRef.current?.()) {
                return;
            }

            removePreInsertedRouteIfNeeded();
        };
    }, [route]);

    useEffect(() => {
        if (route && narrowDestinationStrategy === CONST.NARROW_DESTINATION_STRATEGY.PRE_INSERT && getIsNarrowLayout() && preInsertedRouteRef.current !== route) {
            transitionCancelHandleRef.current = TransitionTracker.runAfterTransitions({
                callback: () => {
                    preInsertTaskRef.current = Scheduler.scheduleWhenIdle(() => runPreInsert(route));
                },
                maxWaitForUpcomingTransitionMs: PRE_INSERT_OPEN_TRANSITION_START_WAIT_MS,
                waitForUpcomingTransition: true,
            });
        }

        return () => {
            cancelPreInsert();
        };
    }, [route, narrowDestinationStrategy]);

    return {
        reveal: revealDestination,
        cleanupPreMount,
    };
}

export default usePreMountDestination;
