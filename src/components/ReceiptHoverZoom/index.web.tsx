import React from 'react';
import type ReceiptHoverZoomProps from './types';
import useReceiptHoverZoom from './useReceiptHoverZoom';

const DEFAULT_SCALE = 2.5;

const wrapperStyle: React.CSSProperties = {position: 'relative', overflow: 'hidden', width: '100%', height: '100%'};
const innerStyle: React.CSSProperties = {width: '100%', height: '100%', transition: 'transform 80ms ease-out', willChange: 'transform'};

function ReceiptHoverZoom({children, isEnabled = true, scale = DEFAULT_SCALE, hoverContainerRef}: ReceiptHoverZoomProps) {
    const {wrapperRef, innerRef, isActive} = useReceiptHoverZoom({isEnabled, scale, hoverContainerRef});

    if (!isActive) {
        return children;
    }

    return (
        <div
            ref={wrapperRef}
            style={wrapperStyle}
        >
            <div
                ref={innerRef}
                style={innerStyle}
            >
                {children}
            </div>
        </div>
    );
}

ReceiptHoverZoom.displayName = 'ReceiptHoverZoom';

export default ReceiptHoverZoom;
