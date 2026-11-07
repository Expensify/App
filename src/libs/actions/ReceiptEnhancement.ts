import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function setIsReceiptEnhancementEnabled(isEnabled: boolean) {
    Onyx.set(ONYXKEYS.IS_RECEIPT_ENHANCEMENT_ENABLED, isEnabled);
}

export {
    // Action files export named functions, like the other files in libs/actions.
    // eslint-disable-next-line import/prefer-default-export
    setIsReceiptEnhancementEnabled,
};
