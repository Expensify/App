import {useEffect} from 'react';
import asHostElement from '@components/Overlay/libs/asHostElement';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import useCallbackRef from '@hooks/useCallbackRef';

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
        const onScroll = (event: Event) => {
            const target = event.target;
            if (target === document || target === window) {
                stableDismiss();
                return;
            }
            if (target instanceof Node && target !== anchorHost && target.contains(anchorHost)) {
                stableDismiss();
            }
        };
        // The anchor rect is captured at open, so a viewport resize can leave it stale; dismiss rather than track to it.
        const onResize = () => stableDismiss();
        window.addEventListener('scroll', onScroll, {capture: true, passive: true});
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, {capture: true});
            window.removeEventListener('resize', onResize);
        };
    }, [anchor, isActive, stableDismiss]);
}

export default useDismissOnAnchorMove;
