import type {OnyxEntry} from 'react-native-onyx';
import {useProductTrainingContext} from '@components/ProductTrainingContext';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type UseReceiptTrainingParams = {
    /** Transaction whose receipt we're inspecting for product-training flags */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

/**
 * Detects whether the current confirmation belongs to a Test Drive scan flow and
 * surfaces the corresponding tooltip state for the confirm button.
 *
 * Also returns `isTestReceipt` so callers can gate unrelated UI (e.g. the participant
 * edit affordance) on whether this is a test receipt.
 */
function useReceiptTraining({transaction}: UseReceiptTrainingParams) {
    const isTestReceipt = transaction?.receipt?.isTestReceipt ?? false;
    const isTestDriveReceipt = transaction?.receipt?.isTestDriveReceipt ?? false;

    const {shouldShowProductTrainingTooltip, renderProductTrainingTooltip} = useProductTrainingContext(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_DRIVE_CONFIRMATION, isTestDriveReceipt);

    return {isTestReceipt, shouldShowProductTrainingTooltip, renderProductTrainingTooltip};
}

export default useReceiptTraining;
