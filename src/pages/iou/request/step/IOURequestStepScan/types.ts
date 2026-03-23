import type {OnyxEntry} from 'react-native-onyx';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type {IOUType} from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

type UseMobileReceiptScanParams = {
    /** The initial transaction */
    initialTransaction: OnyxEntry<Transaction>;

    /** The type of IOU report */
    iouType: IOUType;

    /** Whether multi-scan is enabled */
    isMultiScanEnabled?: boolean;

    /** Whether the user is starting a scan request */
    isStartingScan?: boolean;

    /** The current receipt files being scanned */
    receiptFiles: ReceiptFile[];

    /** Callback to navigate to the confirmation step */
    navigateToConfirmationStep: (files: ReceiptFile[], locationPermissionGranted?: boolean) => void;

    /** Whether the confirmation step should be skipped */
    shouldSkipConfirmation: boolean;

    /** Callback to start the location permission flow */
    setStartLocationPermissionFlow: (value: boolean) => void;

    /** Callback to update multi-scan enabled state in parent */
    setIsMultiScanEnabled: ((value: boolean) => void) | undefined;
};

type IOURequestStepScanProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<Transaction>;

    /** If the receipts preview should be shown */
    isMultiScanEnabled?: boolean;

    /** Updates isMultiScanEnabled flag */
    setIsMultiScanEnabled?: (value: boolean) => void;

    /** Indicates whether users start to create scan request */
    isStartingScan?: boolean;
};

type ReceiptFile = {
    source: ReceiptSource;
    file?: FileObject;
    transactionID: string;
};

export default IOURequestStepScanProps;
export type {ReceiptFile, UseMobileReceiptScanParams};
