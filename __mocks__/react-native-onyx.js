/* eslint-disable rulesdir/prefer-onyx-connect-in-libs */
import Onyx, {withOnyx} from 'react-native-onyx';

let connectCallbackDelay = 0;
function addDelayToConnectCallback(delay) {
    connectCallbackDelay = delay;
}

export default {
    ...Onyx,
    connect: (mapping) =>
        Onyx.connect({
            ...mapping,
            callback: (...params) => {
                if (connectCallbackDelay > 0) {
                    setTimeout(() => {
                        mapping.callback(...params);
                    }, connectCallbackDelay);
                } else {
                    mapping.callback(...params);
                }
            },
        }),
    addDelayToConnectCallback,
};
export {withOnyx};
/* eslint-enable rulesdir/prefer-onyx-connect-in-libs */
