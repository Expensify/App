import asHostElement from '@components/Overlay/libs/asHostElement';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';

import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';

import anchorBoxChanged from './shared';

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

        // Dismiss on resize only if the anchor's box actually changed (position or size) — ignores mobile keyboard / URL-bar resizes that leave it in place.
        const baseline = anchorHost.getBoundingClientRect();
        const onResize = () => {
            if (!anchorBoxChanged(anchorHost.getBoundingClientRect(), baseline)) {
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
                              // An off-screen-but-connected anchor at open must not self-dismiss; a detached one is orphaned, so dismiss it.
                              if (!anchorHost.isConnected) {
                                  dismissOnce();
                              }
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
