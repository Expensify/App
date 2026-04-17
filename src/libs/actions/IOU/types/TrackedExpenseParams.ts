import type {OnyxEntry} from 'react-native-onyx';
import type {CreateWorkspaceParams} from '@libs/API/parameters';
import type {BuildPolicyDataKeys} from '@userActions/Policy/Policy';
import type ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt} from '@src/types/onyx/Transaction';
import type BaseTransactionParams from './BaseTransactionParams';
import type {TrackExpenseAccountantParams} from './CreateTrackExpenseParams';

type TrackedExpenseReportInformation = {
    moneyRequestPreviewReportActionID: string | undefined;
    moneyRequestReportID: string | undefined;
    moneyRequestCreatedReportActionID: string | undefined;
    actionableWhisperReportActionID: string | undefined;
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID: string;
    transactionThreadReportID: string | undefined;
    reportPreviewReportActionID: string | undefined;
    chatReportID: string | undefined;
    isLinkedTrackedExpenseReportArchived: boolean | undefined;
};

type BuildOnyxDataForTrackExpenseKeys =
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS;

type TrackedExpenseTransactionParams = Omit<BaseTransactionParams, 'taxCode' | 'taxAmount' | 'taxValue'> & {
    waypoints?: string;
    distance?: number;
    transactionID: string | undefined;
    receipt?: Receipt;
    taxCode: string;
    taxAmount: number;
    taxValue?: string;
    attendees?: Attendee[];
};

type TrackedExpensePolicyParams = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyID: string | undefined;
    isDraftPolicy?: boolean;
};

type TrackedExpenseParams = {
    onyxData?: OnyxData<
        | BuildOnyxDataForTrackExpenseKeys
        | BuildPolicyDataKeys
        | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS
        | typeof ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE
        | typeof ONYXKEYS.GPS_DRAFT_DETAILS
        | typeof ONYXKEYS.SELF_DM_REPORT_ID
    >;
    reportInformation: TrackedExpenseReportInformation;
    transactionParams: TrackedExpenseTransactionParams;
    policyParams: TrackedExpensePolicyParams;
    createdWorkspaceParams?: CreateWorkspaceParams;
    accountantParams?: TrackExpenseAccountantParams;
    currentUserAccountID: number;
};

export type {TrackedExpenseParams, TrackedExpensePolicyParams, TrackedExpenseTransactionParams, TrackedExpenseReportInformation, BuildOnyxDataForTrackExpenseKeys};
