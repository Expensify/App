import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';

import type {SubmitLock} from '@pages/iou/request/step/confirmation/submission/useSubmitLock';
import type {SubmitExpenseOrchestratorProps} from '@pages/iou/request/step/confirmation/SubmitExpenseOrchestrator';

import type CONST from '@src/CONST';
import type {PersonalDetailsList, PolicyCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/** The page state the submission hooks read. Each variant picks only what its own hook needs. */
type ConfirmationSubmissionParams = {
    // Transaction data
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    canEnterScanFieldsManually: boolean;

    // Report data
    report: OnyxEntry<Report>;
    reportID: string;
    reportDrafts: OnyxCollection<Report>;

    // Policy data
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    isDraftPolicy: boolean;

    // User data
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    participants: Participant[];
    selectedParticipants: Participant[];

    // Request type flags
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isUnreported: boolean;
    isPolicyExpenseChat: boolean;
    isSelfDMDestination: boolean;
    isSubmittingExpenseToDraftWorkspace: boolean;

    // Onyx values
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;

    // Navigation
    backToReport?: string;

    // Submission
    onExpenseWriteWillStart?: () => void;
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

    /** Suppresses the parent discard guard while a confirmed submission navigates away. */
    suppressDiscardPrompt?: () => void;
};

export type {ConfirmationSubmissionParams, ConfirmationVariantProps};
