import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import useScanCapture from '@pages/iou/request/step/IOURequestStepScan/hooks/useScanCapture';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import {replaceReceipt} from '@userActions/IOU/Receipt';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import Camera from './Camera';

type ScanEditReceiptProps = {
    report: OnyxEntry<Report>;
    transactionID: string;
    backTo: Route | undefined;
};

/**
 * ScanEditReceipt — replace an existing receipt and navigate back.
 * Simplest variant: no multi-scan, no participants, no confirmation page.
 */
function ScanEditReceipt({report, transactionID, backTo}: ScanEditReceiptProps) {
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);

    const navigateBack = () => {
        // Fix for issue where navigation state is lost after returning from device settings
        // https://github.com/Expensify/App/issues/65992
        const navigationState = navigationRef.current?.getState();
        const reportsSplitNavigator = navigationState?.routes?.findLast((route) => route.name === 'ReportsSplitNavigator');
        const hasLostNavigationState = reportsSplitNavigator && !reportsSplitNavigator.state;

        if (hasLostNavigationState) {
            Navigation.navigate(backTo ?? ROUTES.INBOX);
        } else {
            Navigation.goBack(backTo);
        }
    };

    const handleCapture = (file: FileObject, source: string) => {
        replaceReceipt({transactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories});
        navigateBack();
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useScanCapture((files: FileObject[]) => {
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = getFileSource(file);
        handleCapture(file, source);
    });

    return (
        <StepScreenDragAndDropWrapper
            headerTitle=""
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="ScanEditReceipt"
        >
            {() => (
                <>
                    {PDFValidationComponent}
                    <Camera
                        onCapture={handleCapture}
                        onDrop={validateFiles}
                        isReplacingReceipt
                    />
                    {ErrorModal}
                </>
            )}
        </StepScreenDragAndDropWrapper>
    );
}

ScanEditReceipt.displayName = 'ScanEditReceipt';

export default ScanEditReceipt;
