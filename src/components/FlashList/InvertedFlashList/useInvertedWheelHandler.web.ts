import type {FlashListRef} from '@shopify/flash-list';
import {useEffect} from 'react';

// FlashList uses its own RecyclerView on web and bypasses react-native-web's
// `invertedWheelEventHandler` patch (VirtualizedList/index.js:702). That patch flips
// wheel delta to compensate for the `scaleY: -1` transform applied by `inverted`.
// Without it, wheel scroll feels reversed: wheel down reveals older messages
// instead of newer. This hook restores parity by intercepting wheel events on the
// scrollable node and translating them into an inverted scrollTop adjustment.
function useInvertedWheelHandler<T>(ref: React.RefObject<FlashListRef<T> | null>) {
    useEffect(() => {
        const node = ref.current?.getScrollableNode?.() as HTMLElement | undefined;
        if (!node) {
            return;
        }

        const handler = (ev: WheelEvent) => {
            const deltaY = ev.deltaY;
            if (!deltaY) {
                return;
            }

            const maxScrollTop = Math.max(0, node.scrollHeight - node.clientHeight);
            const nextScrollTop = node.scrollTop - deltaY;
            node.scrollTop = Math.max(0, Math.min(nextScrollTop, maxScrollTop));

            ev.preventDefault();
            ev.stopPropagation();
        };

        node.addEventListener('wheel', handler, {passive: false});
        return () => node.removeEventListener('wheel', handler);
    }, [ref]);
}

export default useInvertedWheelHandler;
