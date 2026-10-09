import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import type {SubmitExpenseOrchestratorProps} from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';
import type {UseExpenseSubmissionParams} from '@pages/iou/request/step/confirmation/useExpenseSubmission';

/** What the page hands to whichever submission-path variant it renders. */
type ConfirmationVariantProps = {
    /** Everything the submission hooks read. Each variant picks only what its own hook needs. */
    submissionParams: UseExpenseSubmissionParams;

    /** Orchestrator props; the variant supplies `createTransaction` from its own submission hook. */
    orchestratorProps: Omit<SubmitExpenseOrchestratorProps, 'createTransaction' | 'children'>;

    /** List props; `onConfirm` / `isConfirming` come from the orchestrator and `onSendMoney` only from the pay flow. */
    listProps: Omit<MoneyRequestConfirmationListProps, 'onConfirm' | 'isConfirming' | 'onSendMoney'>;
};

export type {ConfirmationVariantProps};
