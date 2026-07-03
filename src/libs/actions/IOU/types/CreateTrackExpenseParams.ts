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
    // TODO: delegateAccountID will be made required in PR 10 when all callers pass the value (https://github.com/Expensify/App/issues/66425)
    delegateAccountID?: number | undefined;
    reportActionsList: OnyxCollection<OnyxTypes.ReportActions> | undefined;
    // Personal details list is optional here because we only use/pass it for SHARE case
    personalDetailsList?: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

export type {CreateTrackExpenseParams, TrackExpenseAccountantParams};
