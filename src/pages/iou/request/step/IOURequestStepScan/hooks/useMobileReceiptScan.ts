import shouldStartLocationPermissionFlowSelector from '@selectors/LocationPermission';
import {useState} from 'react';
import {InteractionManager} from 'react-native';
import {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useOnyx from '@hooks/useOnyx';
import useTransactionDraftValues from '@hooks/useTransactionDraftValues';
import {dismissProductTraining} from '@libs/actions/Welcome';
import HapticFeedback from '@libs/HapticFeedback';
import type {ReceiptFile, UseMobileReceiptScanParams} from '@pages/iou/request/step/IOURequestStepScan/types';
import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

/**
 * Extends useReceiptScan with mobile-only logic: multi-scan, haptic feedback, and blink animation.
 */
function useMobileReceiptScan({
    initialTransaction,
    iouType,
    isMultiScanEnabled,
    isStartingScan,
    receiptFiles,
    navigateToConfirmationStep,
    shouldSkipConfirmation,
    setStartLocationPermissionFlow,
    setIsMultiScanEnabled,
    setReceiptFiles,
}: UseMobileReceiptScanParams) {
    const [shouldStartLocationPermissionFlow] = useOnyx(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, {
        selector: shouldStartLocationPermissionFlowSelector,
    });
    const optimisticTransactions = useTransactionDraftValues();

    const [dismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [shouldShowMultiScanEducationalPopup, setShouldShowMultiScanEducationalPopup] = useState(false);

    const canUseMultiScan = isStartingScan && iouType !== CONST.IOU.TYPE.SPLIT;

    const blinkOpacity = useSharedValue(0);
    const blinkStyle = useAnimatedStyle(() => ({
        opacity: blinkOpacity.get(),
    }));

    function showBlink() {
        blinkOpacity.set(
            withTiming(1, {duration: 50}, () => {
                blinkOpacity.set(withTiming(0, {duration: 150}));
            }),
        );
        HapticFeedback.press();
    }

    function submitReceipts(files: ReceiptFile[]) {
        if (shouldSkipConfirmation) {
            const gpsRequired = initialTransaction?.amount === 0 && iouType !== CONST.IOU.TYPE.SPLIT;
            if (gpsRequired) {
                if (shouldStartLocationPermissionFlow) {
                    setStartLocationPermissionFlow(true);
                    return;
                }
                navigateToConfirmationStep(files, true);
                return;
            }
        }
        navigateToConfirmationStep(files, false);
    }

    function submitMultiScanReceipts() {
        const transactionIDs = new Set(optimisticTransactions?.map((transaction) => transaction?.transactionID));
        const validReceiptFiles = receiptFiles.filter((receiptFile) => transactionIDs.has(receiptFile.transactionID));
        submitReceipts(validReceiptFiles);
    }

    function toggleMultiScan() {
        if (!dismissedProductTraining?.[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL]) {
            setShouldShowMultiScanEducationalPopup(true);
        }
        removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        removeDraftTransactionsByIDs(draftTransactionIDs, true);
        if (isMultiScanEnabled) {
            setReceiptFiles([]);
        }
        setIsMultiScanEnabled(!isMultiScanEnabled);
    }

    function dismissMultiScanEducationalPopup() {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            dismissProductTraining(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.MULTI_SCAN_EDUCATIONAL_MODAL);
            setShouldShowMultiScanEducationalPopup(false);
        });
    }

    return {
        canUseMultiScan,
        blinkStyle,
        showBlink,
        shouldShowMultiScanEducationalPopup,
        dismissMultiScanEducationalPopup,
        toggleMultiScan,
        submitReceipts,
        submitMultiScanReceipts,
    };
}

export default useMobileReceiptScan;
