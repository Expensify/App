import type {OnyxEntry} from 'react-native-onyx';
import type {IOUAction} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';
import type BasePolicyParams from './BasePolicyParams';
import type RequestMoneyParticipantParams from './RequestMoneyParticipantParams';
import type {TrackExpenseTransactionParams} from './TrackExpenseTransactionParams';

type TrackExpenseAccountantParams = {
    accountant?: Accountant;
};

type CreateTrackExpenseParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    isDraftPolicy: boolean;
    action?: IOUAction;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    transactionParams: TrackExpenseTransactionParams;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    accountantParams?: TrackExpenseAccountantParams;
    isRetry?: boolean;
    shouldPlaySound?: boolean;
    /** Passthrough payload — only consumed by `handleFileRetry` to clean up drafts after a successful retry. Ignored by `trackExpense`. */
    draftTransactionIDs?: string[];
    optimisticChatReportID?: string;
    optimisticTransactionID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean;
    defaultWorkspaceName?: string;
    previousOdometerDraft?: OnyxEntry<OnyxTypes.OdometerDraft>;
};

export type {CreateTrackExpenseParams, TrackExpenseAccountantParams};
