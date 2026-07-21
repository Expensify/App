import {scheduleOnRN} from 'react-native-worklets';

/**
 * withTiming also fires this on cancellation (finished === false) — ignore those.
 */
function onAnimationFinished(callback: () => void): (finished?: boolean) => void {
    return (finished?: boolean) => {
        'worklet';

        if (!finished) {
            return;
        }
        scheduleOnRN(callback);
    };
}

export default onAnimationFinished;
