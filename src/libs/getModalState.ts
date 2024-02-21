import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type Modal from '@src/types/onyx/Modal';

let modalState: OnyxEntry<Modal> = {};

Onyx.connect({
    key: ONYXKEYS.MODAL,
    callback: (value) => {
        modalState = value;
    },
});

/**
 * Returns the modal state from onyx.
 * Note: You should use the HOCs/hooks to get onyx data, instead of using this directly.
 * A valid use case to use this is if the value is only needed once for an initial value.
 */
export default function getModalState(): OnyxEntry<Modal> {
    return modalState;
}
