import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import hasHoverSupport from '@libs/DeviceCapabilities/hasHoverSupport';
import type {ReceiptHoverZoomProps} from './types';

const DEFAULT_SCALE = 2.5;
const TRANSITION = 'transform 80ms ease-out';

function ReceiptHoverZoom({children, isEnabled = true, scale = DEFAULT_SCALE, hoverContainerRef}: ReceiptHoverZoomProps): ReactNode {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const enabled = isEnabled && hasHoverSupport();

    const applyOrigin = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
        if (!innerRef.current) {
            return;
        }
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        // Imperative DOM update avoids a React re-render on every mousemove (~60Hz) so panning stays smooth.
        innerRef.current.style.transformOrigin = `${x}% ${y}%`;
    }, []);

    useEffect(() => {
        if (!enabled) {
            return;
        }
        // The hover surface is the parent's receipt container when provided so the zoom keeps engaging
        // while the cursor crosses absolutely-positioned action buttons that sit on top of the image.
        const containerEl = (hoverContainerRef?.current as unknown as HTMLElement | null) ?? wrapperRef.current;
        if (!containerEl) {
            return;
        }

        const handleEnter = () => setIsZoomed(true);
        const handleLeave = () => {
            setIsZoomed(false);
            if (innerRef.current) {
                innerRef.current.style.transformOrigin = 'center center';
            }
        };
        const handleMove = (event: MouseEvent) => {
            applyOrigin(event.clientX, event.clientY, containerEl.getBoundingClientRect());
        };

        containerEl.addEventListener('mouseenter', handleEnter);
        containerEl.addEventListener('mouseleave', handleLeave);
        containerEl.addEventListener('mousemove', handleMove);

        // If the cursor is already over the element on mount, kick off the zoomed state.
        if (containerEl.matches(':hover')) {
            handleEnter();
        }

        return () => {
            containerEl.removeEventListener('mouseenter', handleEnter);
            containerEl.removeEventListener('mouseleave', handleLeave);
            containerEl.removeEventListener('mousemove', handleMove);
        };
        // `hoverContainerRef` is a stable ref object; reading `.current` inside the effect is the
        // correct pattern. ESLint's narrow-hook-deps rule conflicts with the refs rule here, so disable both.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, applyOrigin]);

    if (!enabled) {
        return children;
    }

    return (
        <div
            ref={wrapperRef}
            style={{width: '100%', height: '100%', overflow: 'hidden', position: 'relative'}}
        >
            <div
                ref={innerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${isZoomed ? scale : 1})`,
                    transition: TRANSITION,
                    willChange: 'transform',
                }}
            >
                {children}
            </div>
        </div>
    );
}

ReceiptHoverZoom.displayName = 'ReceiptHoverZoom';

export default ReceiptHoverZoom;
