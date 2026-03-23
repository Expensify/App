import type {OnyxEntry} from 'react-native-onyx';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type SCREENS from '@src/SCREENS';
import type {ReceiptSource} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';

type IOURequestStepScanProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    transaction: OnyxEntry<Transaction>;
};

type ReceiptFile = {
    source: ReceiptSource;
    file?: FileObject;
    transactionID: string;
};

export default IOURequestStepScanProps;
export type {ReceiptFile};
