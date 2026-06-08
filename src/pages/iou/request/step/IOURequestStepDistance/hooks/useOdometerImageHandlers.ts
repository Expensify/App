import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {IOUAction, IOUType, OdometerImageType} from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

type UseOdometerImageHandlersParams = {
    /** Route param: the IOU action (create / edit). */
    action: IOUAction;

    /** Type of IOU flow (request, split, track, etc.). */
    iouType: IOUType;

    /** Route param: the transactionID being acted upon. */
    transactionID: string;

    /** Route param: the originating reportID. */
    reportID: string;

    /** True when navigating in from the confirmation screen to edit. */
    isEditingConfirmation: boolean;

    /** Optional report to return to after the image flow completes. */
    backToReport: string | undefined;

    /** Existing start-reading image, if any. Decides between view vs. capture. */
    odometerStartImage: FileObject | string | undefined;

    /** Existing end-reading image, if any. Decides between view vs. capture. */
    odometerEndImage: FileObject | string | undefined;
};

type UseOdometerImageHandlersResult = {
    /** Press handler for the start-reading image slot. View if an image exists, capture otherwise. */
    handlePressStartImage: () => void;

    /** Press handler for the end-reading image slot. View if an image exists, capture otherwise. */
    handlePressEndImage: () => void;
};

function useOdometerImageHandlers({
    action,
    iouType,
    transactionID,
    reportID,
    isEditingConfirmation,
    backToReport,
    odometerStartImage,
    odometerEndImage,
}: UseOdometerImageHandlersParams): UseOdometerImageHandlersResult {
    const handleCaptureImage = (imageType: OdometerImageType) => {
        Navigation.navigate(ROUTES.ODOMETER_IMAGE.getRoute(action, iouType, transactionID, reportID, imageType, isEditingConfirmation, backToReport));
    };

    const handleViewOdometerImage = (imageType: OdometerImageType) => {
        if (!reportID || !transactionID) {
            return;
        }
        Navigation.navigate(ROUTES.MONEY_REQUEST_ODOMETER_PREVIEW.getRoute(reportID, transactionID, action, iouType, imageType, isEditingConfirmation, backToReport));
    };

    const handlePressStartImage = () => {
        if (odometerStartImage) {
            handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
        } else {
            handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.START);
        }
    };

    const handlePressEndImage = () => {
        if (odometerEndImage) {
            handleViewOdometerImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
        } else {
            handleCaptureImage(CONST.IOU.ODOMETER_IMAGE_TYPE.END);
        }
    };

    return {handlePressStartImage, handlePressEndImage};
}

export default useOdometerImageHandlers;
