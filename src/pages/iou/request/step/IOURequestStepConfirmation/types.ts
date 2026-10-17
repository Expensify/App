import type {RestoreFocus} from '@components/MoneyRequestConfirmationFields/context';

import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import type {WithFullTransactionOrNotFoundProps} from '@pages/iou/request/step/withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from '@pages/iou/request/step/withWritableReportOrNotFound';

import type SCREENS from '@src/SCREENS';

type IOURequestStepConfirmationIncomingRouteName = typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION | typeof SCREENS.MONEY_REQUEST.CREATE;

type StepConfirmationParams = MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION];

type IOURequestStepConfirmationProps = WithWritableReportOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> &
    WithFullTransactionOrNotFoundProps<IOURequestStepConfirmationIncomingRouteName> & {
        shouldHideHeader?: boolean;

        /** Reports whether the inline amount sign differs from its initial value (new manual expense flow) */
        onSignDirtyChange?: (isSignDirty: boolean) => void;

        /** Registers the inline field that should regain focus when the discard confirmation is cancelled */
        onInputFocus?: (restoreFocus: RestoreFocus) => void;

        /** Clears the registered inline field when it blurs */
        onInputBlur?: () => void;

        /** Suppresses the parent discard prompt when the embedded confirmation starts a successful submit */
        suppressDiscardPrompt?: () => void;
    };

export type {IOURequestStepConfirmationProps, StepConfirmationParams};
