import {useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {easing} from '@components/Modal/ReanimatedModal/utils';

const EXPAND_COLLAPSE_DURATION = 300;

function useExpandCollapseAnimation(isExpanded: boolean) {
    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isRendered, setIsRendered] = useState(isExpanded);

    useEffect(() => {
        hasExpanded.set(isExpanded);
    }, [isExpanded, hasExpanded]);

    if (isExpanded && !isRendered) {
        setIsRendered(true);
    }

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration: EXPAND_COLLAPSE_DURATION, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get(),
        overflow: 'hidden' as const,
    }));

    const onLayout = (e: LayoutChangeEvent) => {
        const height = e.nativeEvent.layout.height;
        if (height) {
            contentHeight.set(height);
        }
    };

    return {isRendered, animatedStyle, onLayout};
}

export default useExpandCollapseAnimation;
