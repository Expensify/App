import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

let isCloseAccountErrorModalOpen;
Onyx.connect({
    key: ONYXKEYS.CLOSE_ACCOUNT_DATA,
    callback: data => isCloseAccountErrorModalOpen = Boolean(data && data.error),
});

/**
* Unset CloseAccount error message to hide modal
 */
export default function hideCloseAccountErrorModal() {
    if (!isCloseAccountErrorModalOpen) {
        return;
    }
    Onyx.merge(ONYXKEYS.CLOSE_ACCOUNT_DATA, {error: ''});
}
