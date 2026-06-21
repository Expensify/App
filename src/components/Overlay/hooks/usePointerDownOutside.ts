import {useEffect} from 'react';
import useCallbackRef from '@hooks/useCallbackRef';

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
            const target = event.target;
            if (target instanceof Element) {
                const computed = ownerDocument.defaultView?.getComputedStyle(target);
                if (computed?.pointerEvents === 'none') {
                    return;
                }
            }
            if (stableContainsTarget(event.target)) {
                return;
            }
            if (event.pointerType === 'touch') {
                const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
                    pendingTimers.delete(timer);
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
