import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type {FileObject} from '@pages/media/AttachmentModalScreen/types';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepScanProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;

        /**
         * Callback function that is triggered on the `onLayout` event.
         * Receives a function (`setTestReceiptAndNavigate`) as an argument,
         */
        onLayout?: (setTestReceiptAndNavigate: () => void) => void;

        /** Disable tab swipe */
        setTabSwipeDisabled?: (isDisabled: boolean) => void;

        /** If the receipts preview should be shown */
        isMultiScanEnabled?: boolean;

        /** Updates isMultiScanEnabled flag */
        setIsMultiScanEnabled?: (value: boolean) => void;
    };

type ReceiptFile = {
    source: string;
    file: FileObject;
    transactionID: string;
};

export default IOURequestStepScanProps;
export type {ReceiptFile};
