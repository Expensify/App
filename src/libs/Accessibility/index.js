import {useEffect, useState, useCallback} from 'react';
import {AccessibilityInfo} from 'react-native';
import _ from 'lodash';
import moveAccessibilityFocus from './moveAccessibilityFocus';

const useScreenReaderStatus = () => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    useEffect(() => {
        const unsubscribe = AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
            setIsScreenReaderEnabled(isEnabled);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return isScreenReaderEnabled;
};

const getHitSlopForSize = ({x, y}) => {
    const minimumSize = 44;
    const hitSlopVertical = _.max([minimumSize - x, 0]);
    const hitSlopHorizontal = _.max([minimumSize - y, 0]);
    return {
        top: hitSlopVertical,
        bottom: hitSlopVertical,
        left: hitSlopHorizontal,
        right: hitSlopHorizontal,
    };
};

const useAutoHitSlop = () => {
    const [frameSize, setFrameSize] = useState({x: 0, y: 0});
    const onLayout = useCallback((event) => {
        const {layout} = event.nativeEvent;
        if (layout.width !== frameSize.x && layout.height !== frameSize.y) {
            setFrameSize({frameSize: {x: layout.width, y: layout.height}});
        }
    }, [frameSize]);
    return [getHitSlopForSize(frameSize), onLayout];
};

export default {
    moveAccessibilityFocus,
    useScreenReaderStatus,
    useAutoHitSlop,
};
