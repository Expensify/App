import type {RefObject} from 'react';
import type {MeasureInWindowOnSuccessCallback, View} from 'react-native';

function measureContainer(containerRef: RefObject<View>, callback: MeasureInWindowOnSuccessCallback) {
    if (!containerRef?.current) {
        return;
    }
    containerRef.current.measureInWindow(callback);
}

export default measureContainer;
