import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {CurrentUser} from '@userActions/Policy/Policy';
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
    shouldHandleNavigation?: boolean;
    shouldDeferForSearch?: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUser: CurrentUser;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    draftTransactionIDs: string[] | undefined;
    isSelfTourViewed: boolean;
    defaultWorkspaceName?: string;
    previousOdometerDraft?: OnyxEntry<OnyxTypes.OdometerDraft>;
    // TODO: Remove optional (?) once all callers are updated in follow-up PRs of https://github.com/Expensify/App/issues/66578
    reportActionsList?: OnyxCollection<OnyxTypes.ReportActions>;
};

export type {CreateTrackExpenseParams, TrackExpenseAccountantParams};
