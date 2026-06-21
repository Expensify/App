import {scheduleOnRN} from 'react-native-worklets';

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
