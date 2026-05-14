import type {StyleProp, ViewStyle} from 'react-native';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';
import type {CardList, PersonalDetails, Policy, Report, ReportAction, TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

type TransactionWithOptionalSearchFields = TransactionWithOptionalHighlight & {
    /** The action that can be performed for the transaction */
    action?: SearchTransactionAction;

    /** Function passed to the action button, triggered when the button is pressed */
    onButtonPress?: () => void;

    /** The personal details of the user requesting money */
    from?: PersonalDetails;

    /** The personal details of the user paying the request */
    to?: PersonalDetails;

    /** The date the report was exported */
    exported?: string;

    /** formatted "to" value used for displaying and sorting on Reports page */
    formattedTo?: string;

    /** formatted "from" value used for displaying and sorting on Reports page */
    formattedFrom?: string;

    /** formatted "merchant" value used for displaying and sorting on Reports page */
    formattedMerchant?: string;

    /** information about whether to show merchant, that is provided on Reports page */
    shouldShowMerchant?: boolean;

    /** information about whether to show the description, that is provided on Reports page */
    shouldShowDescription?: boolean;

    /** Precomputed violations */
    violations?: TransactionViolation[];

    /** Used to initiate payment from search page */
    hash?: number;

    /** Report to which the transaction belongs */
    report?: Report;

    /** Policy to which the transaction belongs */
    policy?: Policy;
};

type TransactionItemRowProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    report?: Report;
    policy?: Policy;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    submittedColumnSize?: TableColumnSize;
    approvedColumnSize?: TableColumnSize;
    postedColumnSize?: TableColumnSize;
    exportedColumnSize?: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    onCheckboxPress?: (transactionID: string) => void;
    shouldShowCheckbox?: boolean;
    columns?: SearchColumnType[];
    onButtonPress?: () => void;
    style?: StyleProp<ViewStyle>;
    isReportItemChild?: boolean;
    isActionLoading?: boolean;
    isInSingleTransactionReport?: boolean;
    shouldShowRadioButton?: boolean;
    onRadioButtonPress?: (transactionID: string) => void;
    shouldShowErrors?: boolean;
    shouldHighlightItemWhenSelected?: boolean;
    isDisabled?: boolean;
    violations?: TransactionViolation[];
    shouldShowBottomBorder?: boolean;
    onArrowRightPress?: () => void;
    isHover?: boolean;
    shouldShowArrowRightOnNarrowLayout?: boolean;
    reportActions?: ReportAction[];
    checkboxSentryLabel?: string;
    isLargeScreenWidth?: boolean;
    policyForMovingExpenses?: Policy;
    nonPersonalAndWorkspaceCards?: CardList;
    isActionColumnWide?: boolean;
    shouldRemoveTotalColumnFlex?: boolean;
};

/**
 * Data computed by the dispatcher and consumed by the Narrow variant.
 */
type TransactionItemRowNarrowComputedData = {
    bgActiveStyles: StyleProp<ViewStyle>;
    merchant: string;
    merchantOrDescription: string;
    missingFieldError: string;
    categoryForDisplay: string;
    createdAt: string;
    transactionThreadReportID: string | undefined;
    shouldRenderChatBubbleCell: boolean;
};

/**
 * Data computed by the dispatcher and consumed by the Wide variant.
 * Extends the shared base with fields only the wide layout needs.
 */
type TransactionItemRowWideComputedData = Omit<TransactionItemRowNarrowComputedData, 'merchantOrDescription' | 'shouldRenderChatBubbleCell' | 'categoryForDisplay'> & {
    description: string;
    exchangeRateMessage: string | undefined;
    cardName: string | undefined;
    transactionAttendees: Attendee[];
    shouldShowAttendees: boolean;
    totalPerAttendee: number | undefined;
};

export type {TransactionWithOptionalSearchFields, TransactionItemRowProps, TransactionItemRowNarrowComputedData, TransactionItemRowWideComputedData};
