import type {OnyxEntry} from 'react-native-onyx';
import type {FileObject} from '@components/AttachmentModal';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepScanProps = WithCurrentUserPersonalDetailsProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;

        /* If the tooltip is allowed to be shown */
        isTooltipAllowed?: boolean;
    };

type ReceiptFile = {
    source: string;
    file: FileObject;
    transactionID: string;
};

export default IOURequestStepScanProps;
export type {ReceiptFile};
