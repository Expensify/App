import type useDeleteTransactions from '@hooks/useDeleteTransactions';
import type useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';

import type CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Policy, Report, ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type DynamicReportDetailsPageMenuItem = {
    key: DeepValueOf<typeof CONST.REPORT_DETAILS_MENU_ITEM>;
    translationKey: TranslationPaths;
    icon: IconAsset;
    isAnonymousAction: boolean;
    action: () => void;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    subtitle?: number;
    shouldShowRightIcon?: boolean;
    subtitleStyle?: StyleProp<ViewStyle>;
};

const CASES = {
    DEFAULT: 'default',
    MONEY_REQUEST: 'money_request',
    MONEY_REPORT: 'money_report',
};

type CaseID = ValueOf<typeof CASES>;

type DeleteTransactionsHelpers = ReturnType<typeof useDeleteTransactions>;
type DuplicateTransactionsAndViolations = ReturnType<typeof useDuplicateTransactionsAndViolations>;

/** The money-request cluster read by the delete flow and the track-expense rows, only mounted for the money cases */
type ReportDetailsRequestData = {
    requestParentReportAction: OnyxEntry<ReportAction>;
    iouReport: OnyxEntry<Report>;
    chatIOUReport: OnyxEntry<Report>;
    isChatIOUReportArchived: boolean;
    iouPolicy: OnyxEntry<Policy>;
    iouReportTransactions: Transaction[];
    requestParentReportActionChildReport: OnyxEntry<Report>;
    transactionThreadReportActions: OnyxEntry<ReportActions>;
    isDeletedParentAction: boolean;
    moneyRequestReport: OnyxEntry<Report>;
    isMoneyRequestReportArchived: boolean;
    moneyRequestReportActions: OnyxEntry<ReportActions>;
    iouTransactionID: string | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    iouOriginalTransaction: OnyxEntry<Transaction>;
    duplicateTransactions: DuplicateTransactionsAndViolations['duplicateTransactions'];
    duplicateTransactionViolations: DuplicateTransactionsAndViolations['duplicateTransactionViolations'];
    deleteTransactions: DeleteTransactionsHelpers['deleteTransactions'];
    shouldOpenSplitExpenseEditFlowOnDelete: DeleteTransactionsHelpers['shouldOpenSplitExpenseEditFlowOnDelete'];
    isSingleTransactionView: boolean;
    shouldShowDeleteButton: boolean;
    shouldShowEditSplitOnDeleteAction: boolean;
    deleteMenuItemTitle: string;
};

export {CASES};
export type {CaseID, DynamicReportDetailsPageMenuItem, ReportDetailsRequestData};
