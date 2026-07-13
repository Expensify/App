import type {CurrentUser} from '@userActions/Policy/Policy';

import type {IOUAction} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant} from '@src/types/onyx/IOU';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

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
    /**
     * Whether the action owns the post-create flow: dismiss the money request screens, navigate to the
     * destination and surface the "Expense added" feedback. Defaults to true.
     */
    shouldHandleNavigation?: boolean;
    /**
     * Only read when shouldHandleNavigation is false. Defaults to true: navigation is owned by the
     * orchestrator (dismiss-first paths), which has already navigated, so the action surfaces the
     * post-create feedback (growl/row highlight). Pass false when the caller owns the whole
     * post-create flow - navigation AND feedback - and the action must stay fully silent
     * (e.g. the Share flow, which navigates after the action returns).
     */
    shouldShowPostCreateFeedback?: boolean;
    /** Retry-path cleanup only; the action itself never reads this. */
    draftTransactionIDs?: string[];
    optimisticChatReportID?: string;
    optimisticTransactionID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUser: CurrentUser;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean;
    defaultWorkspaceName?: string;
    currentUserLocalCurrency: string | undefined;
    previousOdometerDraft?: OnyxEntry<OnyxTypes.OdometerDraft>;
    delegateAccountID: number | undefined;
    reportActionsList: OnyxCollection<OnyxTypes.ReportActions> | undefined;
    // TODO: Remove optional (?) once all callers are updated in follow-up PRs of https://github.com/Expensify/App/issues/66414
    isDraftChatReport?: boolean;
    // Personal details list is optional here because we only use/pass it for SHARE case
    personalDetailsList?: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

export type {CreateTrackExpenseParams, TrackExpenseAccountantParams};
