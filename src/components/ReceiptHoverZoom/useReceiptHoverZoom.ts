import {hasHoverSupport} from '@libs/DeviceCapabilities';

import type {RefObject} from 'react';
import type {View} from 'react-native';

import {useEffect, useRef, useState} from 'react';

type UseReceiptHoverZoomConfig = {
    isEnabled: boolean;
    scale: number;
    hoverContainerRef?: RefObject<View | null>;
};

type UseReceiptHoverZoomResult = {
    wrapperRef: RefObject<HTMLDivElement | null>;
    innerRef: RefObject<HTMLDivElement | null>;
    isActive: boolean;
    isHovering: boolean;
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
    // Single source of truth for "the pointer is actively over the receipt", driven by the same listeners as the zoom.
    const [isHovering, setIsHovering] = useState(false);
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
        // Tracked locally so we only push a React state update on the enter/leave transitions, never on every pointer move.
        let hovering = false;

        const endZoom = () => {
            bounds = null;
            hovering = false;
            inner.style.transform = 'scale(1)';
            setIsHovering(false);
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
            if (!hovering) {
                hovering = true;
                setIsHovering(true);
            }
        };

        target.addEventListener('pointerleave', endZoom);
        target.addEventListener('pointermove', updateZoomOrigin);

        return () => {
            target.removeEventListener('pointerleave', endZoom);
            target.removeEventListener('pointermove', updateZoomOrigin);
            inner.style.transform = '';
            inner.style.transformOrigin = '';
            // Detaching the listeners (new source finished loading, zoom disabled mid-regeneration, or unmount) resets the
            // hover state, so overlays reading it wait for a fresh pointer move instead of showing under a parked cursor.
            setIsHovering(false);
        };
    }, [isActive, scale, hoverContainerRef]);

    return {wrapperRef, innerRef, isActive, isHovering};
}

export default useReceiptHoverZoom;
