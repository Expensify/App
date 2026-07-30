import asHostElement from '@components/Overlay/libs/asHostElement';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';

const ANCHOR_MOVE_EPSILON_PX = 1;

function useDismissOnAnchorMove(anchor: AnchorNode | null, onDismiss: () => void, isActive: boolean): void {
    const stableDismiss = useCallbackRef(onDismiss);

    useEffect(() => {
        if (!isActive || !anchor || typeof window === 'undefined') {
            return undefined;
        }
        const anchorHost = asHostElement(anchor);
        if (!anchorHost) {
            return undefined;
        }

        let dismissed = false;
        const dismissOnce = () => {
            if (dismissed) {
                return;
            }
            dismissed = true;
            stableDismiss();
        };

        const onScroll = (event: Event) => {
            const target = event.target;
            if (target === document || target === window) {
                dismissOnce();
                return;
            }
            if (target instanceof Node && target !== anchorHost && target.contains(anchorHost)) {
                dismissOnce();
            }
        };

        // Dismiss on resize only if the anchor actually moved — ignores mobile keyboard / URL-bar resizes.
        const baseline = anchorHost.getBoundingClientRect();
        const onResize = () => {
            const next = anchorHost.getBoundingClientRect();
            if (Math.abs(next.left - baseline.left) <= ANCHOR_MOVE_EPSILON_PX && Math.abs(next.top - baseline.top) <= ANCHOR_MOVE_EPSILON_PX) {
                return;
            }
            dismissOnce();
        };

        window.addEventListener('scroll', onScroll, {capture: true, passive: true});
        window.addEventListener('resize', onResize);

        // Skip the observer's initial-state callback so an anchor off-screen at open can't self-dismiss.
        let sawInitialObservation = false;
        const observer =
            typeof IntersectionObserver === 'function'
                ? new IntersectionObserver(
                      (entries) => {
                          if (!sawInitialObservation) {
                              sawInitialObservation = true;
                              return;
                          }
                          if (entries.every((entry) => entry.isIntersecting)) {
                              return;
                          }
                          dismissOnce();
                      },
                      {threshold: 0},
                  )
                : null;
        observer?.observe(anchorHost);

        return () => {
            window.removeEventListener('scroll', onScroll, {capture: true});
            window.removeEventListener('resize', onResize);
            observer?.disconnect();
        };
    }, [anchor, isActive, stableDismiss]);
}

export default useDismissOnAnchorMove;
