import {useEffect, useRef} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {hasHoverSupport} from '@libs/DeviceCapabilities';

type UseReceiptHoverZoomConfig = {
    isEnabled: boolean;
    scale: number;
    hoverContainerRef?: RefObject<View | null>;
};

type UseReceiptHoverZoomResult = {
    wrapperRef: RefObject<HTMLDivElement | null>;
    innerRef: RefObject<HTMLDivElement | null>;
    isActive: boolean;
};

function resolveHoverTarget(wrapper: HTMLDivElement | null, externalRef: RefObject<View | null> | undefined): HTMLElement | null {
    if (externalRef) {
        const external = externalRef.current as unknown as HTMLElement | null;
        if (external) {
            return external;
        }
    }
    return wrapper;
}

function useReceiptHoverZoom({isEnabled, scale, hoverContainerRef}: UseReceiptHoverZoomConfig): UseReceiptHoverZoomResult {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);
    const isActive = isEnabled && hasHoverSupport();

    useEffect(() => {
        if (!isActive) {
            return undefined;
        }
        const inner = innerRef.current;
        const target = resolveHoverTarget(wrapperRef.current, hoverContainerRef);
        if (!inner || !target) {
            return undefined;
        }

        let bounds: DOMRect | null = null;

        const endZoom = () => {
            bounds = null;
            inner.style.transform = 'scale(1)';
        };
        const updateZoomOrigin = (event: PointerEvent) => {
            if (!bounds) {
                bounds = target.getBoundingClientRect();
            }
            const {left, top, width, height} = bounds;
            if (!width || !height) {
                return;
            }
            const x = ((event.clientX - left) / width) * 100;
            const y = ((event.clientY - top) / height) * 100;
            inner.style.transformOrigin = `${x}% ${y}%`;
            inner.style.transform = `scale(${scale})`;
        };

        target.addEventListener('pointerleave', endZoom);
        target.addEventListener('pointermove', updateZoomOrigin);

        return () => {
            target.removeEventListener('pointerleave', endZoom);
            target.removeEventListener('pointermove', updateZoomOrigin);
            inner.style.transform = '';
            inner.style.transformOrigin = '';
        };
    }, [isActive, scale, hoverContainerRef]);

    return {wrapperRef, innerRef, isActive};
}

export default useReceiptHoverZoom;
