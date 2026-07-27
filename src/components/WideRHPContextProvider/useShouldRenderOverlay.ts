import {useEffect, useRef, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

const OVERLAY_TIMING_DURATION = 300;

function useShouldRenderOverlay(condition: boolean, overlayProgress: Animated.Value) {
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

    // Holds the latest `condition` so the async hide callback can read it.
    const conditionRef = useRef(condition);

    useEffect(() => {
        conditionRef.current = condition;

        if (condition) {
            setShouldRenderOverlay(true);
            Animated.timing(overlayProgress, {
                toValue: 1,
                duration: OVERLAY_TIMING_DURATION,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(overlayProgress, {
                toValue: 0,
                duration: OVERLAY_TIMING_DURATION,
                useNativeDriver: false,
            }).start(() => {
                if (conditionRef.current) {
                    return;
                }
                setShouldRenderOverlay(false);
            });
        }
    }, [condition, overlayProgress]);

    return shouldRenderOverlay;
}

export default useShouldRenderOverlay;
