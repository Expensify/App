import React from 'react';
import CONST from '@src/CONST';
import type ReceiptHoverZoomProps from './types';
import useReceiptHoverZoom from './useReceiptHoverZoom';

const DEFAULT_SCALE = CONST.RECEIPT.HOVER_ZOOM_SCALE;

const wrapperStyle: React.CSSProperties = {position: 'relative', overflow: 'hidden', width: '100%', height: '100%'};
const innerStyle: React.CSSProperties = {width: '100%', height: '100%', transition: 'transform 80ms ease-out', willChange: 'transform'};

function ReceiptHoverZoom({children, isEnabled = true, scale = DEFAULT_SCALE, hoverContainerRef}: ReceiptHoverZoomProps) {
    const {wrapperRef, innerRef, isActive, isHovering} = useReceiptHoverZoom({isEnabled, scale, hoverContainerRef});
    const content = typeof children === 'function' ? children({isHovering}) : children;

    if (!isActive) {
        return content;
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
                {content}
            </div>
        </div>
    );
}

ReceiptHoverZoom.displayName = 'ReceiptHoverZoom';

export default ReceiptHoverZoom;
