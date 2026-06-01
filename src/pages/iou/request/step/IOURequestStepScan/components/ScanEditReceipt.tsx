import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useFullScreenLoaderActions} from '@components/FullScreenLoaderContext';
import useFilesValidation from '@hooks/useFilesValidation';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import getFileSource from '@pages/iou/request/step/IOURequestStepScan/utils/getFileSource';
import StepScreenDragAndDropWrapper from '@pages/iou/request/step/StepScreenDragAndDropWrapper';
import {replaceReceipt, setMoneyRequestReceipt} from '@userActions/IOU/Receipt';
import NAVIGATORS from '@src/NAVIGATORS';
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
    isEditing: boolean;
};

/**
 * ScanEditReceipt — replace an existing receipt and navigate back.
 * Simplest variant: no multi-scan, no participants, no confirmation page.
 */
function ScanEditReceipt({report, transactionID, backTo, isEditing}: ScanEditReceiptProps) {
    const {translate} = useLocalize();
    const policy = usePolicy(report?.policyID);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report?.policyID}`);
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const {setIsLoaderVisible} = useFullScreenLoaderActions();

    const navigateBack = () => {
        // Fix for issue where navigation state is lost after returning from device settings
        // https://github.com/Expensify/App/issues/65992
        const navigationState = navigationRef.current?.getState();
        const reportsSplitNavigator = navigationState?.routes?.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        const hasLostNavigationState = reportsSplitNavigator && !reportsSplitNavigator.state;

        if (hasLostNavigationState) {
            Navigation.navigate(backTo ?? ROUTES.INBOX);
        } else {
            Navigation.goBack(backTo);
        }
    };

    const handleCapture = (file: FileObject, source: string) => {
        if (isEditing) {
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', false, file.type);
            replaceReceipt({transactionID, file: file as File, source, transactionPolicy: policy, transactionPolicyCategories: policyCategories, transactionPolicyTagList: policyTagList});
        } else {
            setMoneyRequestReceipt(transactionID, source, file.name ?? '', true, file.type);
        }
        navigateBack();
    };

    const {validateFiles, PDFValidationComponent, ErrorModal} = useFilesValidation((files: FileObject[]) => {
        const file = files.at(0);
        if (!file) {
            return;
        }
        const source = getFileSource(file);
        handleCapture(file, source);
    });

    return (
        <StepScreenDragAndDropWrapper
            headerTitle={translate('common.receipt')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="ScanEditReceipt"
        >
            {PDFValidationComponent}
            <Camera
                onCapture={handleCapture}
                onPicked={validateFiles}
                onAttachmentPickerStatusChange={setIsLoaderVisible}
                isReplacingReceipt
            />
            {ErrorModal}
        </StepScreenDragAndDropWrapper>
    );
}

ScanEditReceipt.displayName = 'ScanEditReceipt';

export default ScanEditReceipt;
