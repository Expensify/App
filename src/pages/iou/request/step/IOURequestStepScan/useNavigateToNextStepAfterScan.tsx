import {useCallback, useEffect, useState} from 'react';
import type {FileObject} from '@components/AttachmentModal';
import Navigation from '@libs/Navigation/Navigation';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {IOURequestStepScanProps} from './types';

type UseNavigateToNextStepAfterScanParams = {
    transaction: IOURequestStepScanProps['transaction'];
    reportID: string;
    transactionID: string;
    backTo: Route;
    iouType: IOUType;
};

/**
 * This is a shared hook to navigate to next step after uploading a receipt
 * The idea is to ensure the transaction in Onyx state is updated with uploaded file and source before navigating to the next step
 * to avoid the check for missing receipt in the next step.
 *
 * In order to achieve that, we will set the uploadedFile and uploadedSource in the state
 * and install a useEffect to match the uploaded state with the transaction data. Once the uploaded state matches the transaction data, it indicates
 * that the uploadedFile and uploadedSource has been updated in the transaction data and we can navigate to the next step.
 */
const useNavigateToNextStepAfterScan = ({transaction, reportID, transactionID, backTo, iouType}: UseNavigateToNextStepAfterScanParams) => {
    const [[uploadedFile, uploadedSource], setFileAndSource] = useState<[FileObject | null, string | null]>([null, null]);
    const [destinationOption, setDestinationOption] = useState<number>(0);

    const moveBackToOriginalPage = (file: FileObject, source: string) => {
        setFileAndSource([file, source]);
        setDestinationOption(1);
    };
    const moveToParticipantSelectionStep = (file: FileObject, source: string) => {
        setFileAndSource([file, source]);
        setDestinationOption(2);
    };
    const moveToConfirmationStep = (file: FileObject, source: string) => {
        setFileAndSource([file, source]);
        setDestinationOption(3);
    };

    const navigateToParticipantPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const navigateToConfirmationPage = useCallback(() => {
        switch (iouType) {
            case CONST.IOU.TYPE.REQUEST:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
                break;
            case CONST.IOU.TYPE.SEND:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
                break;
            default:
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
        }
    }, [iouType, reportID, transactionID]);

    const resetState = useCallback(() => {
        setDestinationOption(0);
        setFileAndSource([null, null]);
    }, []);

    useEffect(() => {
        if (!uploadedFile?.name || !uploadedSource || transaction?.filename !== uploadedFile.name || transaction?.receipt?.source !== uploadedSource) {
            return;
        }
        // reset state, indicating that the navigation has been completed
        resetState();

        // navigate based on destination option
        if (destinationOption === 1) {
            Navigation.goBack(backTo);
            return;
        }

        if (destinationOption === 2) {
            navigateToParticipantPage();
            return;
        }

        if (destinationOption === 3) {
            navigateToConfirmationPage();
        }
    }, [transaction, uploadedFile, uploadedSource, navigateToParticipantPage, navigateToConfirmationPage, destinationOption, resetState, backTo]);

    return {moveBackToOriginalPage, moveToParticipantSelectionStep, moveToConfirmationStep};
};

export default useNavigateToNextStepAfterScan;
