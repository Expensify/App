import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import type {ListItemProps} from '@components/SelectionList/ListItem/types';
import type {ListItem} from '@components/SelectionList/types';
import type CONST from '@src/CONST';
import type {
    BillingGraceEndPeriod,
    CardList,
    LastPaymentMethod,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    Report,
    ReportAction,
    SearchResults,
    TransactionViolation,
    TransactionViolations,
} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Errors, Icon} from '@src/types/onyx/OnyxCommon';
import type {
    SearchCardGroup,
    SearchCategoryGroup,
    SearchDataTypes,
    SearchMemberGroup,
    SearchMerchantGroup,
    SearchMonthGroup,
    SearchQuarterGroup,
    SearchTagGroup,
    SearchTask,
    SearchTransactionAction,
    SearchWeekGroup,
    SearchWithdrawalIDGroup,
    SearchYearGroup,
} from '@src/types/onyx/SearchResults';
import type Transaction from '@src/types/onyx/Transaction';

type SearchListActionProps = {
    /** The last payment method used per policy */
    lastPaymentMethod?: OnyxEntry<LastPaymentMethod>;
    /** The user's personal policy ID */
    personalPolicyID?: string;
    /** Billing grace period end dates for workspace owners (shared across all list items) */
    userBillingGracePeriodEnds?: OnyxCollection<BillingGraceEndPeriod>;
    /** The workspace owner's billing grace period end date */
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
};

type ChatListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    queryJSONHash?: number;

    /** The report data */
    report?: Report;

    /** The user wallet tierName */
    userWalletTierName: string | undefined;

    /** Whether the user is validated */
    isUserValidated: boolean | undefined;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** User billing fund ID */
    userBillingFundID: number | undefined;
};

type ExpenseReportListItemProps<TItem extends ListItem> = ListItemProps<TItem> &
    SearchListActionProps & {
        /** The visible columns for the report */
        columns?: SearchColumnType[];

        /** Whether the item's action is loading */
        isLoading?: boolean;
    };

type TransactionListItemType = ListItem &
    Transaction & {
        /** Report to which the transaction belongs */
        report: Report | undefined;

        /** The date the report was submitted */
        submitted?: string;

        /** The date the report was approved */
        approved?: string;

        /** The date the report was posted */
        posted?: string;

        /** The date the report was exported */
        exported?: string;

        /** Policy to which the transaction belongs */
        policy: Policy | undefined;

        /** Report IOU action to which the transaction belongs */
        reportAction: ReportAction | undefined;

        /** Transaction thread HOLD action if the transaction is on hold */
        holdReportAction: ReportAction | undefined;

        /** The personal details of the user requesting money */
        from: PersonalDetails;

        /** The personal details of the user paying the request */
        to: PersonalDetails;

        /** final and formatted "from" value used for displaying and sorting */
        formattedFrom: string;

        /** final and formatted "to" value used for displaying and sorting */
        formattedTo: string;

        /** final and formatted "total" value used for displaying and sorting */
        formattedTotal: number;

        /** final and formatted "merchant" value used for displaying and sorting */
        formattedMerchant: string;

        /** The original amount of the transaction */
        originalAmount?: number;

        /** The original currency of the transaction */
        originalCurrency?: string;

        /** final "date" value used for sorting */
        date: string;

        /** Whether we should show the merchant column */
        shouldShowMerchant: boolean;

        /** Whether we should show the transaction year.
         * This is true if at least one transaction in the dataset was created in past years
         */
        shouldShowYear: boolean;

        /** Whether we should show the year for the submitted date.
         * This is true if at least one transaction in the dataset was submitted in past years
         */
        shouldShowYearSubmitted: boolean;

        /** Whether we should show the year for the approved date.
         * This is true if at least one transaction in the dataset was approved in past years
         */
        shouldShowYearApproved: boolean;

        /** Whether we should show the year for the posted date.
         * This is true if at least one transaction in the dataset was posted in past years
         */
        shouldShowYearPosted: boolean;

        /** Whether we should show the year for the exported date.
         * This is true if at least one transaction in the dataset was exported in past years
         */
        shouldShowYearExported: boolean;

        isAmountColumnWide: boolean;

        isTaxAmountColumnWide: boolean;

        /** Whether the action column should use its wider variant.
         * This is true if at least one transaction in the dataset is deleted.
         */
        isActionColumnWide?: boolean;

        /** Key used internally by React */
        keyForList: string;

        /** The name of the file used for a receipt */
        filename?: string;

        /** Attendees in the transaction */
        attendees?: Attendee[];

        /** Precomputed violations */
        violations?: TransactionViolation[];

        /** The CC for this transaction */
        cardID?: number;

        /** The display name of the purchaser card, if any */
        cardName?: string;

        /** The available actions that can be performed for the transaction */
        allActions: SearchTransactionAction[];

        /** The main action that can be performed for the transaction */
        action: SearchTransactionAction;

        /** The tax code of the transaction */
        taxCode?: string;
    };

type TransactionGroupListItemType = ListItem & {
    /** List of grouped transactions */
    transactions: TransactionListItemType[];

    /** Whether the report has a single transaction */
    isOneTransactionReport?: boolean;

    /** The hash of the query to get the transactions data */
    transactionsQueryJSON?: SearchQueryJSON;

    /** Whether the report has visible violations for user */
    hasVisibleViolations?: boolean;

    /** Whether the report was rejected (REJECTED or REJECTEDTOSUBMITTER) */
    isRejectedReport?: boolean;
};

type ExpenseReportListItemType = TransactionReportGroupListItemType;

type TransactionReportGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT} & Report & {
        /** The personal details of the user requesting money */
        from: PersonalDetails;

        /** The personal details of the user paying the request */
        to: PersonalDetails;

        /** Final and formatted "status" value used for displaying and sorting */
        formattedStatus?: string;

        /** Final and formatted "from" value used for displaying and sorting */
        formattedFrom?: string;

        /** Final and formatted "to" value used for displaying and sorting */
        formattedTo?: string;

        /** The date the report was exported */
        exported?: string;

        /** Whether the status field should be shown in a pending state */
        shouldShowStatusAsPending?: boolean;

        /**
         * Whether we should show the report year.
         * This is true if at least one report in the dataset was created in past years
         */
        shouldShowYear: boolean;

        /**
         * Whether we should show the year for the submitted date.
         * This is true if at least one report in the dataset was submitted in past years
         */
        shouldShowYearSubmitted: boolean;

        /**
         * Whether we should show the year for the approved date.
         * This is true if at least one report in the dataset was approved in past years
         */
        shouldShowYearApproved: boolean;

        /**
         * Whether we should show the year for the exported date.
         * This is true if at least one report in the dataset was exported in past years
         */
        shouldShowYearExported: boolean;

        /** The main action that can be performed for the report */
        action: SearchTransactionAction | undefined;

        /** The available actions that can be performed for the report */
        allActions?: SearchTransactionAction[];

        /** Pre-computed total display spend amount */
        totalDisplaySpend?: number;

        /** Pre-computed non-reimbursable spend amount */
        nonReimbursableSpend?: number;

        /** Pre-computed reimbursable spend amount */
        reimbursableSpend?: number;

        /** Whether the amount column should use the wide layout */
        isAmountColumnWide?: boolean;

        /** Whether the action column should use its wider variant when any transaction in the dataset is deleted */
        isActionColumnWide?: boolean;

        /** Pre-computed flag indicating whether all transactions are scanning */
        isAllScanning?: boolean;

        /** Pre-computed primary avatar icon for the report */
        primaryAvatar?: Icon;

        /** Pre-computed secondary avatar icon for the report (workspace icon for subscript display) */
        secondaryAvatar?: Icon;

        /** Layout type for the report avatar, matching CONST.REPORT_ACTION_AVATARS.TYPE */
        avatarType?: ValueOf<typeof CONST.REPORT_ACTION_AVATARS.TYPE>;
    };

type TaskListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Whether the item's action is loading */
    isLoading?: boolean;

    /** All the data of the report collection */
    allReports?: OnyxCollection<Report>;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type TaskListItemType = ListItem &
    SearchTask & {
        /** The personal details of the user who is assigned to the task */
        assignee: PersonalDetails;

        /** The personal details of the user who created the task */
        createdBy: PersonalDetails;

        /** final and formatted "assignee" value used for displaying and sorting */
        formattedAssignee: string;

        /** final and formatted "createdBy" value used for displaying and sorting */
        formattedCreatedBy: string;

        /** The name of the parent report room */
        parentReportName?: string;

        /** The icon of the parent  report room */
        parentReportIcon?: Icon;

        /** The report details of the task */
        report?: Report;

        /** Key used internally by React */
        keyForList: string;

        /**
         * Whether we should show the task year.
         * This is true if at least one task in the dataset was created in past years
         */
        shouldShowYear: boolean;
    };

type ReportActionListItemType = ListItem &
    ReportAction & {
        /** The personal details of the user posting comment */
        from: PersonalDetails;

        /** final and formatted "from" value used for displaying and sorting */
        formattedFrom: string;

        /** final "date" value used for sorting */
        date: string;

        /** Key used internally by React */
        keyForList: string;

        /** The name of the report */
        reportName: string;
    };

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType | ExpenseReportListItemType;

type TransactionCardGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARD} & PersonalDetails &
    SearchCardGroup & {
        /** Final and formatted "cardName" value used for displaying and sorting */
        formattedCardName?: string;

        /** Final and formatted "feedName" value used for displaying and sorting */
        formattedFeedName?: string;
    };

type TransactionMemberGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.FROM} & PersonalDetails &
    SearchMemberGroup & {
        /** Final and formatted "from" value used for displaying and sorting */
        formattedFrom?: string;
    };

type TransactionMonthGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.MONTH} & SearchMonthGroup & {
        /** Final and formatted "month" value used for displaying */
        formattedMonth: string;

        /** Key used for sorting */
        sortKey: number;
    };

type TransactionWithdrawalIDGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID} & SearchWithdrawalIDGroup & {
        /** Final and formatted "withdrawalID" value used for displaying and sorting */
        formattedWithdrawalID?: string;

        /** Whether any withdrawn date in the current results belongs to a past year */
        shouldShowYearWithdrawn?: boolean;
    };

type TransactionCategoryGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.CATEGORY} & SearchCategoryGroup & {
        /** Final and formatted "category" value used for displaying and sorting */
        formattedCategory?: string;
    };

type TransactionMerchantGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.MERCHANT} & SearchMerchantGroup & {
        /** Final and formatted "merchant" value used for displaying and sorting */
        formattedMerchant?: string;
    };

type TransactionTagGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.TAG} & SearchTagGroup & {
        /** Final and formatted "tag" value used for displaying and sorting */
        formattedTag?: string;
    };

type TransactionWeekGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.WEEK} & SearchWeekGroup & {
        /** Final and formatted "week" value used for displaying */
        formattedWeek: string;
    };

type TransactionYearGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.YEAR} & SearchYearGroup & {
        /** Final and formatted "year" value used for displaying */
        formattedYear: string;

        /** Key used for sorting */
        sortKey: number;
    };

type TransactionQuarterGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.QUARTER} & SearchQuarterGroup & {
        /** Final and formatted "quarter" value used for displaying */
        formattedQuarter: string;

        /** Sort key for sorting */
        sortKey: number;
    };

type TransactionListItemProps<TItem extends ListItem> = ListItemProps<TItem> &
    SearchListActionProps & {
        /** Whether the item's action is loading */
        isLoading?: boolean;
        columns?: SearchColumnType[];
        violations?: Record<string, TransactionViolations | undefined> | undefined;
        policyForMovingExpenses?: Policy;
        /** Non-personal and workspace cards for company card display */
        nonPersonalAndWorkspaceCards?: CardList;
        /** Callback to undelete a transaction */
        onUndelete?: (transaction: Transaction) => void;
    };

type TransactionGroupListItemProps<TItem extends ListItem> = ListItemProps<TItem> &
    SearchListActionProps & {
        groupBy?: SearchGroupBy;
        searchType?: SearchDataTypes;
        policies?: OnyxCollection<Policy>;
        accountID?: number;
        columns?: SearchColumnType[];
        newTransactionID?: string;
        violations?: Record<string, TransactionViolations | undefined> | undefined;
        policyForMovingExpenses?: Policy;
        /** Non-personal and workspace cards for company card display */
        nonPersonalAndWorkspaceCards?: CardList;
        /** Callback to undelete a transaction */
        onUndelete?: (transaction: Transaction) => void;
    };

type TransactionGroupListExpandedProps<TItem extends ListItem> = Pick<
    TransactionGroupListItemProps<TItem>,
    | 'showTooltip'
    | 'canSelectMultiple'
    | 'onCheckboxPress'
    | 'columns'
    | 'groupBy'
    | 'accountID'
    | 'isOffline'
    | 'violations'
    | 'onSelectRow'
    | 'nonPersonalAndWorkspaceCards'
    | 'onUndelete'
    | 'policyForMovingExpenses'
> & {
    transactions: TransactionListItemType[];
    transactionsVisibleLimit: number;
    setTransactionsVisibleLimit: React.Dispatch<React.SetStateAction<number>>;
    isEmpty: boolean;
    isExpenseReportType: boolean;
    transactionsSnapshot?: SearchResults;
    shouldDisplayEmptyView: boolean;
    transactionsQueryJSON?: SearchQueryJSON;
    isInSingleTransactionReport: boolean;
    searchTransactions: (pageSize?: number) => void;
    onLongPress: (transaction: TransactionListItemType) => void;
};

type UnreportedExpenseListItemType = Transaction & {
    isDisabled: boolean;
    keyForList: string;
    errors?: Errors;
};

export type {
    SearchListActionProps,
    ChatListItemProps,
    ExpenseReportListItemProps,
    TransactionReportGroupListItemType,
    ExpenseReportListItemType,
    SearchListItem,
    TaskListItemProps,
    TaskListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionCardGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionYearGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionGroupListItemProps,
    TransactionGroupListExpandedProps,
    TransactionListItemProps,
    ReportActionListItemType,
    UnreportedExpenseListItemType,
};
