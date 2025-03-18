import type React from 'react';
import type {LayoutRectangle, NativeMethods} from 'react-native';

export default function measureTooltipCoordinate(target: React.Component & Readonly<NativeMethods>, updateTargetBounds: (rect: LayoutRectangle) => void, showTooltip: () => void) {
    return target?.measure((x, y, width, height, px, py) => {
        updateTargetBounds({height, width, x: px, y: py});
        showTooltip();
    });
}

function getTooltipCoordinates(target: React.Component & Readonly<NativeMethods>, callback: (rect: LayoutRectangle) => void) {
    return target?.measure((x, y, width, height, px, py) => {
        callback({height, width, x: px, y: py});
    });
}

export {getTooltipCoordinates};
