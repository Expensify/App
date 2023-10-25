import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let modalState = {};

Onyx.connect({
    key: ONYXKEYS.MODAL,
    callback: (val) => {
        modalState = val;
    },
});

/**
 * Returns the modal state from onyx.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use case to use this is if the value is only needed once for an initial value.
 * @returns {Object}
 */
export default function getModalState() {
    return modalState;
}
