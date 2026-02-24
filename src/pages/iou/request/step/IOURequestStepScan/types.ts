import type {OnyxEntry} from 'react-native-onyx';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type {IOUAction, IOUType} from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

type UseReceiptScanParams = {
    /** The report associated with money request */
    report: OnyxEntry<Report>;

    /** The ID of the report */
    reportID: string;

    /** The ID of the initial transaction */
    initialTransactionID: string;

    /** The initial transaction */
    initialTransaction: OnyxEntry<Transaction>;

    /** The type of IOU report */
    iouType: IOUType;

    /** The action being performed (create, edit) */
    action: IOUAction;

    /** Current user personal details */
    currentUserPersonalDetails: CurrentUserPersonalDetails;

    /** Route to navigate back to */
    backTo: Route | undefined;

    /** Report ID to navigate back to */
    backToReport: string | undefined;

    /** Whether multi-scan is enabled */
    isMultiScanEnabled: boolean | undefined;

    /** Whether the user is starting a scan request */
    isStartingScan: boolean | undefined;

    /** Callback to replace receipt and navigate back when editing */
    updateScanAndNavigate: (file: FileObject, source: string) => void;

    /** Returns a source URL for the file based on platform */
    getSource: (file: FileObject) => string;

    /** Callback to update multi-scan enabled state in parent */
    setIsMultiScanEnabled: ((value: boolean) => void) | undefined;
};

type IOURequestStepScanProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<Transaction>;

        /**
         * Callback function that is triggered on the `onLayout` event.
         * Receives a function (`setTestReceiptAndNavigate`) as an argument,
         */
        onLayout?: (setTestReceiptAndNavigate: () => void) => void;

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
export type {ReceiptFile, UseReceiptScanParams};
