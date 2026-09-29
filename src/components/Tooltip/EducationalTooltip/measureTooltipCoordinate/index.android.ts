import type {HostInstance, LayoutRectangle} from 'react-native';

export default function measureTooltipCoordinate(target: Readonly<HostInstance>, updateTargetBounds: (rect: LayoutRectangle) => void, showTooltip: () => void) {
    return target?.measure((x, y, width, height, px, py) => {
        updateTargetBounds({height, width, x: px, y: py});
        showTooltip();
    });
}

function getTooltipCoordinates(target: Readonly<HostInstance>, callback: (rect: LayoutRectangle) => void) {
    return target?.measure((x, y, width, height, px, py) => {
        callback({height, width, x: px, y: py});
    });
}

export {getTooltipCoordinates};
