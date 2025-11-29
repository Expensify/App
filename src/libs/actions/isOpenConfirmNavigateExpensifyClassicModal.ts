import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsOpenConfirmNavigateExpensifyClassicModalOpen(isOpen: boolean) {
    Onyx.merge(ONYXKEYS.IS_OPEN_CONFIRM_NAVIGATE_EXPENSIFY_CLASSIC_MODAL_OPEN, isOpen);
}

export {
    // eslint-disable-next-line import/prefer-default-export
    setIsOpenConfirmNavigateExpensifyClassicModalOpen,
};
