import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';

import type SCREENS from '@src/SCREENS';

type IOURequestStepConfirmationIncomingRouteName = typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION | typeof SCREENS.MONEY_REQUEST.CREATE;

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> &
    WithFullTransactionOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> & {
        shouldHideHeader?: boolean;
    };

export default IOURequestStepConfirmationProps;
