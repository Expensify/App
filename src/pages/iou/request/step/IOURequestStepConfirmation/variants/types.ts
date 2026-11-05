import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import type useDistanceSubmission from '@pages/iou/request/step/confirmation/submission/useDistanceSubmission';
import type useInvoiceSubmission from '@pages/iou/request/step/confirmation/submission/useInvoiceSubmission';
import type usePerDiemSubmission from '@pages/iou/request/step/confirmation/submission/usePerDiemSubmission';
import type useRequestMoneySubmission from '@pages/iou/request/step/confirmation/submission/useRequestMoneySubmission';
import type useSendMoneySubmission from '@pages/iou/request/step/confirmation/submission/useSendMoneySubmission';
import type useSplitSubmission from '@pages/iou/request/step/confirmation/submission/useSplitSubmission';
import type {SubmitLock} from '@pages/iou/request/step/confirmation/submission/useSubmitLock';
import type useTrackExpenseSubmission from '@pages/iou/request/step/confirmation/submission/useTrackExpenseSubmission';
import type {TransactionTaxValues} from '@pages/iou/request/step/confirmation/submission/utils/getTransactionTaxValues';
import type {SubmitExpenseOrchestratorProps} from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

type SubmissionHookParams = Parameters<typeof useRequestMoneySubmission>[0] &
    Parameters<typeof useTrackExpenseSubmission>[0] &
    Parameters<typeof useDistanceSubmission>[0] &
    Parameters<typeof useSplitSubmission>[0] &
    Parameters<typeof usePerDiemSubmission>[0] &
    Parameters<typeof useInvoiceSubmission>[0] &
    Parameters<typeof useSendMoneySubmission>[0];

/** Hook params the variants compute themselves. Pick fails to compile if a hook no longer declares one. */
type VariantComputedParams = keyof Pick<SubmissionHookParams, keyof TransactionTaxValues | 'isGPSDistanceRequest' | 'isTrackExpense' | 'policyID' | 'releaseSubmitLock' | 'setIsConfirmed'>;

/** The page state the submission hooks read. Derived from the hooks' params so the page can't pass a stale field. */
type ConfirmationSubmissionParams = Omit<SubmissionHookParams, VariantComputedParams> & {
    /** Prevents double submission */
    submitLock: SubmitLock;
};

/** What the page hands to whichever submission-path variant it renders. */
type ConfirmationVariantProps = {
    /** Everything the submission hooks read. Each variant picks only what its own hook needs. */
    submissionParams: ConfirmationSubmissionParams;

    /** Orchestrator props. The variant supplies `createTransaction` from its own submission hook. */
    orchestratorProps: Omit<SubmitExpenseOrchestratorProps, 'createTransaction' | 'children'>;

    /** List props. `onConfirm` and `isConfirming` come from the orchestrator, and `onSendMoney` only from the pay flow. */
    listProps: Omit<MoneyRequestConfirmationListProps, 'onConfirm' | 'isConfirming' | 'onSendMoney'>;
};

export type {ConfirmationSubmissionParams, ConfirmationVariantProps};
