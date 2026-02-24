import {useEffect, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

const OVERLAY_TIMING_DURATION = 300;

function useShouldRenderOverlay(condition: boolean, overlayProgress: Animated.Value) {
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

    useEffect(() => {
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
                setShouldRenderOverlay(false);
            });
        }
    }, [condition, overlayProgress]);

    return shouldRenderOverlay;
}

export default useShouldRenderOverlay;
