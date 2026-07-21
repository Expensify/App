import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';

const TOUCH_CLICK_DEFER_MS = 50;

type ContainsTarget = (target: EventTarget | null) => boolean;

type UsePointerDownOutsideOptions = {
    isActive?: boolean;
    ownerDocument?: Document;
};

const defaultDocument = typeof document === 'undefined' ? undefined : document;

function usePointerDownOutside(callback: (event: PointerEvent) => void, containsTarget: ContainsTarget, options: UsePointerDownOutsideOptions = {}): void {
    const {isActive = true, ownerDocument = defaultDocument} = options;
    const stableCallback = useCallbackRef(callback);
    const stableContainsTarget = useCallbackRef(containsTarget);

    useEffect(() => {
        if (!isActive || !ownerDocument) {
            return undefined;
        }
        const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

        const handlePointerDown = (event: PointerEvent) => {
            // Cheap containment check first — only outside clicks pay for the getComputedStyle style recalc below.
            if (stableContainsTarget(event.target)) {
                return;
            }
            const target = event.target;
            if (target instanceof Element) {
                const computed = ownerDocument.defaultView?.getComputedStyle(target);
                if (computed?.pointerEvents === 'none') {
                    return;
                }
            }
            // Defer touch so the synthesized click can land before the layer closes.
            if (event.pointerType === 'touch') {
                const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
                    pendingTimers.delete(timer);
                    if (stableContainsTarget(event.target)) {
                        return;
                    }
                    stableCallback(event);
                }, TOUCH_CLICK_DEFER_MS);
                pendingTimers.add(timer);
                return;
            }
            stableCallback(event);
        };

        ownerDocument.addEventListener('pointerdown', handlePointerDown, {capture: true});
        return () => {
            for (const timer of pendingTimers) {
                clearTimeout(timer);
            }
            pendingTimers.clear();
            ownerDocument.removeEventListener('pointerdown', handlePointerDown, {capture: true});
        };
    }, [isActive, ownerDocument, stableCallback, stableContainsTarget]);
}

export default usePointerDownOutside;
