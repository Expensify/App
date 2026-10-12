import {useEffect, useRef, useState} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated, Platform} from 'react-native';

const OVERLAY_TIMING_DURATION = 300;
// These values only drive opacity, so native can animate them while the incoming report renders on JS.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function useShouldRenderOverlay(condition: boolean, overlayProgress: Animated.Value) {
    const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

    // Holds the latest `condition` so the async hide callback can read it.
    const conditionRef = useRef(condition);

    useEffect(() => {
        conditionRef.current = condition;

        // Commit the transparent overlay before starting its fade. Report rendering can otherwise
        // consume the animation duration before the conditionally rendered overlay even mounts.
        if (!shouldRenderOverlay) {
            overlayProgress.setValue(0);
            if (condition) {
                setShouldRenderOverlay(true);
            }
            return;
        }

        const animation = Animated.timing(overlayProgress, {
            toValue: condition ? 1 : 0,
            duration: OVERLAY_TIMING_DURATION,
            useNativeDriver: USE_NATIVE_DRIVER,
        });
        animation.start(({finished}) => {
            if (!finished || conditionRef.current) {
                return;
            }
            setShouldRenderOverlay(false);
        });

        return () => animation.stop();
    }, [condition, overlayProgress, shouldRenderOverlay]);

    return shouldRenderOverlay;
}

export default useShouldRenderOverlay;
