import type {LayoutRectangle, NativeMethods} from 'react-native';

export default function measureTooltipCoordinate(target: Readonly<NativeMethods>, updateTargetBounds: (rect: LayoutRectangle) => void, showTooltip: () => void) {
    return target?.measureInWindow((x, y, width, height) => {
        updateTargetBounds({height, width, x, y});
        showTooltip();
    });
}

function getTooltipCoordinates(target: Readonly<NativeMethods>, callback: (rect: LayoutRectangle) => void) {
    return target?.measureInWindow((x, y, width, height) => {
        callback({height, width, x, y});
    });
}

export {getTooltipCoordinates};
