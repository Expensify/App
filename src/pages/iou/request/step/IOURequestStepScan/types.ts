import type {OnyxEntry} from 'react-native-onyx';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type IOURequestStepOnyxProps = {
    user: OnyxEntry<OnyxTypes.User>;
};

type IOURequestStepScanProps = IOURequestStepOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SCAN | typeof SCREENS.MONEY_REQUEST.CREATE> & {
        /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
        transaction: OnyxEntry<OnyxTypes.Transaction>;
    };

export type {IOURequestStepOnyxProps, IOURequestStepScanProps};
