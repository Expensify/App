import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {Route} from '@src/ROUTES';

import {useEffect, useRef} from 'react';

import type {IdlePreInsertTask} from './schedulePreInsertWhenIdle';
import type {AfterTransition, UsePreMountDestinationOptions, UsePreMountDestinationResult} from './types';

import schedulePreInsertWhenIdle from './schedulePreInsertWhenIdle';

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
    const shouldPreservePreInsertedRouteOnUnmount = options?.shouldPreservePreInsertedRouteOnUnmount;

    const shouldUseNarrowLayoutAtFlowStartRef = useRef(getIsNarrowLayout());
    const preInsertTaskRef = useRef<IdlePreInsertTask | undefined>(undefined);
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

    useEffect(() => {
        hasRevealBeenCalledRef.current = false;
    }, [route]);

    // Keep this passive so route-change cleanup reads the preserve callback from the route being cleaned up.
    useEffect(() => {
        shouldPreservePreInsertedRouteOnUnmountRef.current = shouldPreservePreInsertedRouteOnUnmount;
    }, [shouldPreservePreInsertedRouteOnUnmount]);

    useEffect(() => {
        return () => {
            cancelPreInsert();

            if (hasRevealBeenCalledRef.current || shouldPreservePreInsertedRouteOnUnmountRef.current?.()) {
                return;
            }

            removePreInsertedRouteIfNeeded();
        };
    }, [route]);

    useEffect(() => {
        // Layout is intentionally treated as a flow-start decision. If the window is resized
        // mid-flow, finish using the strategy selected when this hook mounted.
        if (!route || !shouldUseNarrowLayoutAtFlowStartRef.current || preInsertedRouteRef.current === route) {
            return;
        }

        const runPreInsert = () => {
            preInsertTaskRef.current = undefined;

            if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                return;
            }

            Navigation.preInsertFullscreenUnderRHP(route, {
                shouldIgnoreLayout: true,
            });
            if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                preInsertedRouteRef.current = route;
            }
        };

        transitionCancelHandleRef.current = TransitionTracker.runAfterTransitions({
            callback: () => {
                preInsertTaskRef.current = schedulePreInsertWhenIdle(runPreInsert);
            },
            maxWaitForUpcomingTransitionMs: PRE_INSERT_OPEN_TRANSITION_START_WAIT_MS,
            waitForUpcomingTransition: true,
        });

        return cancelPreInsert;
    }, [route]);

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

    return {
        reveal: revealDestination,
        cleanupPreMount,
    };
}

export default usePreMountDestination;
