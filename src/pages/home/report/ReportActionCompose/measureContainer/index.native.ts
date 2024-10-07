import type {RefObject} from 'react';
import type {MeasureInWindowOnSuccessCallback, View} from 'react-native';

function measureContainer(containerRef: RefObject<View>, callback: MeasureInWindowOnSuccessCallback) {
    if (!containerRef?.current) {
        return;
    }
    containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        callback(x + pageX, y + pageY, width, height);
    });
}

export default measureContainer;
