import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {SearchColumnType, TableColumnSize} from '@components/Search/types';

import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';

import type {CardList, PersonalDetails, Policy, PolicyCategories, PolicyTagLists, Report, ReportAction, TransactionViolation} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

import type {StyleProp, ViewStyle} from 'react-native';

type TransactionWithOptionalSearchFields = TransactionWithOptionalHighlight & {
    /** The action that can be performed for the transaction */
    action?: SearchTransactionAction;

    /** Function passed to the action button, triggered when the button is pressed */
    onButtonPress?: (event?: ModifiedMouseEvent) => void;

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
    /** Chat report the transaction's report belongs to. Passed to the Pay action so flat transaction rows resolve the invoice room the same way grouped report rows do. */
    chatReport?: Report;
    policy?: Policy;
    policyCategories?: PolicyCategories;
    policyTagLists?: PolicyTagLists;
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
    onButtonPress?: (event?: ModifiedMouseEvent) => void;
    style?: StyleProp<ViewStyle>;
    isReportItemChild?: boolean;
    isActionLoading?: boolean;
    isInSingleTransactionReport?: boolean;
    shouldShowRadioButton?: boolean;
    onRadioButtonPress?: (transactionID: string) => void;
    shouldStopRadioButtonMouseDownPropagation?: boolean;
    radioButtonContainerStyle?: StyleProp<ViewStyle>;
    radioButtonWrapperStyle?: StyleProp<ViewStyle>;
    shouldShowErrors?: boolean;
    shouldHighlightItemWhenSelected?: boolean;
    isDisabled?: boolean;
    shouldDisableActionPointerEvents?: boolean;
    violations?: TransactionViolation[];
    shouldShowBottomBorder?: boolean;
    onArrowRightPress?: (event?: ModifiedMouseEvent) => void;
    isHover?: boolean;
    shouldShowArrowRightOnNarrowLayout?: boolean;
    reportActions?: ReportAction[];
    /** Precomputed transaction-thread report ID. When provided, skips the per-row report-actions scan used to derive it
     * (lets callers that already know the thread mapping avoid O(transactions × actions) work). */
    transactionThreadReportID?: string;
    checkboxSentryLabel?: string;
    isLargeScreenWidth?: boolean;
    /** Precomputed shouldShowAttendees(SUBMIT, policyForMovingExpenses); drilled instead of the policy object
     * to keep the prop ref content-stable across unrelated policy updates. */
    isAttendeesEnabledForMovingPolicy?: boolean;
    nonPersonalAndWorkspaceCards?: CardList;
    isActionColumnWide?: boolean;
    shouldRemoveTotalColumnFlex?: boolean;
    /** Callbacks for inline cell editing */
    onEditDate?: (newDate: string) => void;
    onEditMerchant?: (newMerchant: string) => void;
    onEditDescription?: (newDescription: string) => void;
    onEditCategory?: (newCategory: string) => void;
    onEditAmount?: (newAmount: number) => void;
    onEditTag?: (newTag: string) => void;

    /** Per-field edit permissions — controls whether the cell shows editable affordance */
    canEditDate?: boolean;
    canEditMerchant?: boolean;
    canEditDescription?: boolean;
    canEditCategory?: boolean;
    canEditAmount?: boolean;
    canEditTag?: boolean;
};

/** Window position of the hovered cell used to anchor the receipt preview beside the row. */
type AnchorPosition = {top: number; left: number; width: number; height: number};

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
    isMarkAsDone: boolean;
};

export type {AnchorPosition, TransactionWithOptionalSearchFields, TransactionItemRowProps, TransactionItemRowNarrowComputedData, TransactionItemRowWideComputedData};
