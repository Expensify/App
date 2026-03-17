import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOptimisticDraftTransactions from '@hooks/useOptimisticDraftTransactions';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {endSpan} from '@libs/telemetry/activeSpans';
import bridgeCameraToValidation from '@pages/iou/request/step/IOURequestStepScan/utils/bridgeCameraToValidation';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import useScanFileReadabilityCheck from '@pages/iou/request/step/IOURequestStepScan/utils/useScanFileReadabilityCheck';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';

/**
 * ScanEditReceipt — the simplest scan variant.
 * Used when the user is editing/replacing an existing receipt (backTo or isEditing).
 *
 * Press handler: replaceReceipt -> navigateBack
 */
function ScanEditReceipt() {
    const route = useRoute<PlatformStackRouteProp<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.STEP_SCAN>>();
    const {action, reportID, transactionID: initialTransactionID, backTo} = route.params;

    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [initialTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${initialTransactionID}`);
    const [transactions] = useOptimisticDraftTransactions(initialTransaction);

    const isEditing = action === CONST.IOU.ACTION.EDIT;
    const shouldShowWrapper = !!backTo || isEditing;

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const updateScanAndNavigate = (file: FileObject, source: string) => {
        replaceReceipt({transactionID: initialTransactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
        navigateBack();
    };

    function processReceipts(files: FileObject[]) {
        if (files.length === 0) {
            return;
        }

        // For editing, just replace the receipt
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = getFileSource(file);
        setMoneyRequestReceipt(initialTransactionID, source, file.name ?? '', !isEditing, file.type);
        updateScanAndNavigate(file, source);
    }

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        processReceipts(files);
    });

    function handleCapture(file: FileObject, source: string) {
        bridgeCameraToValidation(file, source, validateFiles);
    }

    // End the create expense span on mount
    useEffect(() => {
        endSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE);
    }, []);

    useScanFileReadabilityCheck(transactions);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper={shouldShowWrapper}
            testID="IOURequestStepScan"
        >
            <View>
                {PDFValidationComponent}
                <Camera
                    // eslint-disable-next-line react/jsx-no-bind -- React Compiler handles memoization
                    onCapture={handleCapture}
                    shouldAcceptMultipleFiles={false}
                />
                {ErrorModal}
            </View>
        </StepScreenWrapper>
    );
}

ScanEditReceipt.displayName = 'ScanEditReceipt';

export default ScanEditReceipt;
