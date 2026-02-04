import type {ForwardedRef, JSXElementConstructor, ReactElement, ReactNode, RefObject} from 'react';
import type {
    BlurEvent,
    GestureResponderEvent,
    InputModeOptions,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollViewProps,
    SectionListData,
    StyleProp,
    TargetedEvent,
    TextInput,
    TextStyle,
    ViewStyle,
} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {SearchRouterItem} from '@components/Search/SearchAutocompleteList';
import type {SearchColumnType, SearchGroupBy, SearchQueryJSON} from '@components/Search/types';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import type UnreportedExpenseListItem from '@pages/UnreportedExpenseListItem';
// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';
import type {TransactionPreviewData} from '@userActions/Search';
import type CONST from '@src/CONST';
import type {PersonalDetails, PersonalDetailsList, Policy, Report, ReportAction, SearchResults, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
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
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import type ChatListItem from './ChatListItem';
import type InviteMemberListItem from './InviteMemberListItem';
import type RadioListItem from './RadioListItem';
import type SearchQueryListItem from './Search/SearchQueryListItem';
import type TransactionGroupListItem from './Search/TransactionGroupListItem';
import type TransactionListItem from './Search/TransactionListItem';
import type UserListItem from './UserListItem';

type TRightHandSideComponent<TItem extends ListItem> = {
    /** Component to display on the right side */
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;
};

type CommonListItemProps<TItem extends ListItem> = {
    /** Whether this item is focused (for arrow key controls) */
    isFocused?: boolean;

    /** Whether this item is disabled */
    isDisabled?: boolean | null;

    /** Whether this item should show Tooltip */
    showTooltip: boolean;

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple?: boolean;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Styles for the pressable component */
    pressableStyle?: StyleProp<ViewStyle>;

    /** Styles for the pressable component wrapper view */
    pressableWrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Styles for the wrapper view */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Styles for the container view */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the checkbox wrapper view if select multiple option is on */
    selectMultipleStyle?: StyleProp<ViewStyle>;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Whether to wrap the alternate text up to 2 lines */
    isAlternateTextMultilineSupported?: boolean;

    /** Number of lines to show for alternate text */
    alternateTextNumberOfLines?: number;

    /** Handles what to do when the item is focused */
    onFocus?: ListItemFocusEventHandler;

    /** Callback to fire when the item is long pressed */
    onLongPressRow?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

    /** Whether to show the right caret */
    shouldShowRightCaret?: boolean;

    /** Whether to highlight the selected item */
    shouldHighlightSelectedItem?: boolean;

    /** Whether to disable the hover style of the item */
    shouldDisableHoverStyle?: boolean;

    /** Whether to call stopPropagation on the mouseleave event in BaseListItem */
    shouldStopMouseLeavePropagation?: boolean;
} & TRightHandSideComponent<TItem>;

type ListItemFocusEventHandler = (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void;

type ExtendedTargetedEvent = TargetedEvent & {
    /** Provides information about the input device responsible for the event, or null if triggered programmatically, available in some browsers */
    sourceCapabilities?: {
        /** A boolean value that indicates whether the device dispatches touch events. */
        firesTouchEvents: boolean;
    };
};

type ListItem<K extends string | number = string> = {
    /** Text to display */
    text?: string;

    /** Text to be announced by screen reader */
    accessibilityLabel?: string;

    /** Alternate text to display */
    alternateText?: string | null;

    /** Key used internally by React */
    keyForList?: K | null;

    /** Whether this option is selected */
    isSelected?: boolean;

    /** Whether the option can show both selected and error indicators */
    canShowSeveralIndicators?: boolean;

    /** Whether the checkbox should be disabled */
    isDisabledCheckbox?: boolean;

    /** Whether this option is disabled for selection */
    isDisabled?: boolean | null;

    /** Whether this item should be interactive at all */
    isInteractive?: boolean;

    /** List title is bold by default. Use this props to customize it */
    isBold?: boolean;

    /** User accountID */
    accountID?: number | null;

    /** User login */
    login?: string | null;

    /** Element to show on the left side of the item */
    leftElement?: ReactNode;

    /** Element to show on the right side of the item */
    rightElement?: ReactNode;

    /** Icons for the user (can be multiple if it's a Workspace) */
    icons?: Icon[];

    /** Errors that this user may contain */
    errors?: Errors | ReceiptErrors;

    /** The type of action that's pending  */
    pendingAction?: PendingAction;

    invitedSecondaryLogin?: string;

    /** Represents the index of the section it came from  */
    sectionIndex?: number;

    /** Represents the index of the option within the section it came from */
    index?: number;

    /** ID of the report */
    reportID?: string;

    /** ID of the policy */
    policyID?: string;

    /** ID of the group */
    groupID?: string;

    /** ID of the category */
    categoryID?: string;

    /** Whether this option should show subscript */
    shouldShowSubscript?: boolean | null;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Whether to wrap the alternate text up to 2 lines */
    isAlternateTextMultilineSupported?: boolean;

    /** The search value from the selection list */
    searchText?: string | null;

    /** What text to show inside the badge (if none present the badge will be omitted) */
    badgeText?: string;

    /** Whether the brick road indicator should be shown */
    brickRoadIndicator?: BrickRoad | '' | null;

    /** Element to render below the ListItem */
    footerContent?: ReactNode;

    /** Whether item pressable wrapper should be focusable */
    tabIndex?: 0 | -1;

    /** The style to override the cursor appearance */
    cursorStyle?: CursorStyles[keyof CursorStyles];

    /** Determines whether the newly added item should animate in / highlight */
    shouldAnimateInHighlight?: boolean;

    /** The style to override the default appearance */
    itemStyle?: StyleProp<ViewStyle>;

    /** Boolean whether to display the right icon */
    shouldShowRightIcon?: boolean;

    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;

    /** Used to initiate payment from search page */
    hash?: number;

    /** Whether check box state is indeterminate */
    isIndeterminate?: boolean;
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

        /** Whether the card feed has been deleted */
        isCardFeedDeleted?: boolean;

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

type ExpenseReportListItemType = TransactionReportGroupListItemType;

type TransactionGroupListItemType = ListItem & {
    /** List of grouped transactions */
    transactions: TransactionListItemType[];

    /** Whether the report has a single transaction */
    isOneTransactionReport?: boolean;

    /** The hash of the query to get the transactions data */
    transactionsQueryJSON?: SearchQueryJSON;

    /** Whether the report has visible violations for user */
    hasVisibleViolations?: boolean;
};

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

type TransactionCardGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARD} & PersonalDetails &
    SearchCardGroup & {
        /** Final and formatted "cardName" value used for displaying and sorting */
        formattedCardName?: string;

        /** Final and formatted "feedName" value used for displaying and sorting */
        formattedFeedName?: string;
    };

type TransactionWithdrawalIDGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID} & SearchWithdrawalIDGroup & {
        /** Final and formatted "withdrawalID" value used for displaying and sorting */
        formattedWithdrawalID?: string;
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

type ListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    /** The section list item */
    item: TItem;

    /** Additional styles to apply to text */
    style?: StyleProp<TextStyle>;

    /** Is item hovered */
    isHovered?: boolean;

    /** Whether the default focus should be prevented on row selection */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Prevent the submission of the list item when enter key is pressed */
    shouldPreventEnterKeySubmit?: boolean;

    /** Key used internally by React */
    keyForList?: string;

    /**
     * Whether the focus on the element should be synchronized. For example it should be set to false when the text input above list items is currently focused.
     * When we type something into the text input, the first element found is focused, in this situation we should not synchronize the focus on the element because we will lose the focus from the text input.
     */
    shouldSyncFocus?: boolean;

    /** Whether to show RBR */
    shouldDisplayRBR?: boolean;

    /** Styles applied for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles applied for the title container of the list item */
    titleContainerStyles?: StyleProp<ViewStyle>;

    /** Whether to show the default right hand side checkmark */
    shouldUseDefaultRightHandSideCheckmark?: boolean;

    /** Whether the network is offline */
    isOffline?: boolean;

    /** Index of the item in the list */
    index?: number;

    /** Callback when the input inside the item is focused (if input exists) */
    onInputFocus?: (index: number) => void;

    /** Callback when the input inside the item is blurred (if input exists) */
    onInputBlur?: (e: BlurEvent) => void;
};

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> &
    ForwardedFSClassProps & {
        item: TItem;
        shouldPreventDefaultFocusOnSelectRow?: boolean;
        shouldPreventEnterKeySubmit?: boolean;
        shouldShowBlueBorderOnFocus?: boolean;
        keyForList?: string | null;
        errors?: Errors | ReceiptErrors | null;
        pendingAction?: PendingAction | null;
        FooterComponent?: ReactElement;
        children?: ReactElement<ListItemProps<TItem>> | ((hovered: boolean) => ReactElement<ListItemProps<TItem>>);
        shouldSyncFocus?: boolean;
        hoverStyle?: StyleProp<ViewStyle>;
        /** Errors that this user may contain */
        shouldDisplayRBR?: boolean;
        /** Test ID of the component. Used to locate this view in end-to-end tests. */
        testID?: string;
        /** Whether to show the default right hand side checkmark */
        shouldUseDefaultRightHandSideCheckmark?: boolean;
    };

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> &
    ForwardedFSClassProps & {
        /** Errors that this user may contain */
        errors?: Errors | ReceiptErrors | null;

        /** The type of action that's pending  */
        pendingAction?: PendingAction | null;

        /** The React element that will be shown as a footer */
        FooterComponent?: ReactElement;
    };

type TransactionSelectionListItem<TItem extends ListItem> = ListItemProps<TItem> & Transaction;

type InviteMemberListItemProps<TItem extends ListItem> = UserListItemProps<TItem> & {
    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;
    index?: number;
    sectionIndex?: number;
};

type UserSelectionListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

type RadioListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type SingleSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type MultiSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TableListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TransactionListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Whether the item's action is loading */
    isLoading?: boolean;
    columns?: SearchColumnType[];
    violations?: Record<string, TransactionViolations | undefined> | undefined;
    customCardNames?: Record<number, string>;
    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;
    /** Whether the DEW beta flag is enabled */
    isDEWBetaEnabled?: boolean;
};

type TaskListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Whether the item's action is loading */
    isLoading?: boolean;

    /** All the data of the report collection */
    allReports?: OnyxCollection<Report>;

    /** Personal details list */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type ExpenseReportListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** The visible columns for the report */
    columns?: SearchColumnType[];

    /** Whether the item's action is loading */
    isLoading?: boolean;

    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;

    /** Whether the DEW beta flag is enabled */
    isDEWBetaEnabled?: boolean;
};

type TransactionGroupListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    groupBy?: SearchGroupBy;
    searchType?: SearchDataTypes;
    policies?: OnyxCollection<Policy>;
    accountID?: number;
    columns?: SearchColumnType[];
    newTransactionID?: string;
    violations?: Record<string, TransactionViolations | undefined> | undefined;
    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;
    /** Whether the DEW beta flag is enabled */
    isDEWBetaEnabled?: boolean;
};

type TransactionGroupListExpandedProps<TItem extends ListItem> = Pick<
    TransactionGroupListItemProps<TItem>,
    'showTooltip' | 'canSelectMultiple' | 'onCheckboxPress' | 'columns' | 'groupBy' | 'accountID' | 'isOffline' | 'violations'
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

type ChatListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    queryJSONHash?: number;

    /** The policies which the user has access to */
    policies?: OnyxCollection<Policy>;

    /** All the data of the report collection */
    allReports?: OnyxCollection<Report>;

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

type ValidListItem =
    | typeof RadioListItem
    | typeof UserListItem
    | typeof InviteMemberListItem
    | typeof TransactionListItem
    | typeof TransactionGroupListItem
    | typeof ChatListItem
    | typeof SearchQueryListItem
    | typeof SearchRouterItem
    | typeof UnreportedExpenseListItem;

type Section<TItem extends ListItem> = {
    /** Title of the section */
    title?: string;

    /** Array of options */
    data?: TItem[];

    /** Whether this section items disabled for selection */
    isDisabled?: boolean;

    /** Whether this section should be shown or not */
    shouldShow?: boolean;
};

type LoadingPlaceholderComponentProps = {
    shouldStyleAsTable?: boolean;
    fixedNumItems?: number;
    speed?: number;
};

type SectionWithIndexOffset<TItem extends ListItem> = Section<TItem> & {
    /** The initial index of this section given the total number of options in each section's data array */
    indexOffset?: number;
};

type SelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> & {
    /** Sections for the section list */
    sections: Array<SectionListDataType<TItem>> | typeof CONST.EMPTY_ARRAY;

    /** List of selected items */
    selectedItems?: string[];

    /** Whether the item is selected */
    isSelected?: (item: TItem) => boolean;

    /** Default renderer for every item in the list */
    ListItem: ValidListItem;

    shouldUseUserSkeletonView?: boolean;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Whether to single execution `onRowSelect` - workaround for unintentional multiple navigation calls https://github.com/Expensify/App/issues/44443 */
    shouldSingleExecuteRowSelect?: boolean;

    /** Whether to update the focused index on a row select */
    shouldUpdateFocusedIndex?: boolean;

    /** Optional callback function triggered upon pressing a checkbox. If undefined and the list displays checkboxes, checkbox interactions are managed by onSelectRow, allowing for pressing anywhere on the list. */
    onCheckboxPress?: (item: TItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onSelectAll?: () => void;

    /**
     * Callback that should return height of the specific item
     * Only use this if we're handling some non-standard items, most of the time the default value is correct
     */
    getItemHeight?: (item: TItem) => number;

    /** Whether autoCorrect functionality should enable  */
    autoCorrect?: boolean;

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Label for the text input */
    textInputLabel?: string;

    /** Style for the text input */
    textInputStyle?: StyleProp<ViewStyle>;

    /** Placeholder for the text input */
    textInputPlaceholder?: string;

    /** Hint for the text input */
    textInputHint?: string;

    /** Value for the text input */
    textInputValue?: string;

    /** Max length for the text input */
    textInputMaxLength?: number;

    /** Icon to display on the left side of TextInput */
    textInputIconLeft?: IconAsset;

    /** Whether text input should be focused */
    textInputAutoFocus?: boolean;

    /** Callback to fire when the text input changes */
    onChangeText?: (text: string) => void;

    /** Input mode for the text input */
    inputMode?: InputModeOptions;

    /** Whether the text input should intercept swipes or not */
    shouldTextInputInterceptSwipe?: boolean;

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string | null;

    /** Whether the text input should be shown after list header */
    shouldShowTextInputAfterHeader?: boolean;

    /** Whether the header message should be shown after list header */
    shouldShowHeaderMessageAfterHeader?: boolean;

    /** Whether to include padding bottom */
    includeSafeAreaPaddingBottom?: boolean;

    /** Callback to fire when the list is scrolled */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Callback to fire when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;

    /** Message to display at the top of the list */
    headerMessage?: string;

    /** Styles to apply to the header message */
    headerMessageStyle?: StyleProp<ViewStyle>;

    /** Styles to apply to submit button */
    confirmButtonStyles?: StyleProp<ViewStyle>;

    /** Text to display on the confirm button */
    confirmButtonText?: string;

    /** Callback to fire when the confirm button is pressed */
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem) => void;

    /** Whether to show the vertical scroll indicator */
    showScrollIndicator?: boolean;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** The component to show when the list is loading */
    LoadingPlaceholderComponent?: React.ComponentType<LoadingPlaceholderComponentProps>;

    /** Whether to show the default confirm button */
    showConfirmButton?: boolean;

    /** Whether to show the default confirm button disabled */
    isConfirmButtonDisabled?: boolean;

    /** Whether to use the default theme for the confirm button */
    shouldUseDefaultTheme?: boolean;

    /** Whether tooltips should be shown */
    shouldShowTooltips?: boolean;

    /** Whether to stop automatic propagation on pressing enter key or not */
    shouldStopPropagation?: boolean;

    /** Whether to call preventDefault() on pressing enter key or not */
    shouldPreventDefault?: boolean;

    /** Whether to prevent default focusing of options and focus the text input when selecting an option */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to subscribe to KeyboardShortcut arrow keys events */
    shouldSubscribeToArrowKeyEvents?: boolean;

    /** Custom content to display in the header */
    headerContent?: ReactNode;

    /** Custom content to display in the header of list component. */
    listHeaderContent?: React.JSX.Element | null;

    /** By default, when `listHeaderContent` is passed, the section title will not be rendered. This flag allows the section title to still be rendered in certain cases. */
    showSectionTitleWithListHeaderContent?: boolean;

    /** Custom content to display in the footer */
    footerContent?: ReactNode;

    /** Custom content to display in the footer of list component. If present ShowMore button won't be displayed */
    listFooterContent?: React.JSX.Element | null;

    /** Custom content to display above the pagination */
    footerContentAbovePagination?: React.JSX.Element | null;

    /** Custom content to display when the list is empty after finish loading */
    listEmptyContent?: React.JSX.Element | null;

    /** Whether to use dynamic maxToRenderPerBatch depending on the visible number of elements */
    shouldUseDynamicMaxToRenderPerBatch?: boolean;

    /** Whether keyboard shortcuts should be disabled */
    disableKeyboardShortcuts?: boolean;

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles to apply to SectionList component */
    sectionListStyle?: StyleProp<ViewStyle>;

    /** Whether to ignore the focus event */
    shouldIgnoreFocus?: boolean;

    /** Whether focus event should be delayed */
    shouldDelayFocus?: boolean;

    /** Whether we should clear the search input when an item is selected */
    shouldClearInputOnSelect?: boolean;

    /** Callback to fire when the text input changes */
    onArrowFocus?: (focusedItem: TItem) => void;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Fired when the list is displayed with the items */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Custom header to show right above list */
    customListHeader?: ReactNode;

    /** When customListHeader is provided, this should be its height needed for correct list scrolling */
    customListHeaderHeight?: number;

    /** Styles for the list header wrapper */
    listHeaderWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether to wrap long text up to 2 lines */
    isRowMultilineSupported?: boolean;

    /** Whether to wrap the alternate text up to 2 lines */
    isAlternateTextMultilineSupported?: boolean;

    /** Number of lines to show for alternate text */
    alternateTextNumberOfLines?: number;

    /** Ref for textInput */
    textInputRef?: RefObject<TextInput | null> | ((ref: TextInput | null) => void);

    /** Styles for the section title */
    sectionTitleStyles?: StyleProp<ViewStyle>;

    /** Styles applied for the title of the list item */
    listItemTitleStyles?: StyleProp<TextStyle>;

    /** Styles applied for the select all text */
    selectAllStyle?: StyleProp<TextStyle>;

    /** Styles applied for the title container of the list item */
    listItemTitleContainerStyles?: StyleProp<ViewStyle>;

    /** This may improve scroll performance for large lists */
    removeClippedSubviews?: boolean;

    /**
     * When true, the list won't be visible until the list layout is measured. This prevents the list from "blinking" as it's scrolled to the bottom which is recommended for large lists.
     * When false, the list will render immediately and scroll to the bottom which works great for small lists.
     */
    shouldHideListOnInitialRender?: boolean;

    /** Called once when the scroll position gets within onEndReachedThreshold of the rendered content. */
    onEndReached?: () => void;

    /**
     * How far from the end (in units of visible length of the list) the bottom edge of the
     * list must be from the end of the content to trigger the `onEndReached` callback.
     * Thus a value of 0.5 will trigger `onEndReached` when the end of the content is
     * within half the visible length of the list.
     */
    onEndReachedThreshold?: number;

    /**
     * While maxToRenderPerBatch tells the amount of items rendered per batch, setting updateCellsBatchingPeriod tells your VirtualizedList the delay in milliseconds between batch renders (how frequently your component will be rendering the windowed items).
     * https://reactnative.dev/docs/optimizing-flatlist-configuration#updatecellsbatchingperiod
     */
    updateCellsBatchingPeriod?: number;

    /**
     * The number passed here is a measurement unit where 1 is equivalent to your viewport height. The default value is 21 (10 viewports above, 10 below, and one in between).
     * https://reactnative.dev/docs/optimizing-flatlist-configuration#windowsize
     */
    windowSize?: number;

    /** Callback to fire when the item is long pressed */
    onLongPressRow?: (item: TItem) => void;

    /** Whether to show the empty list content */
    shouldShowListEmptyContent?: boolean;

    /** The style is applied for the wrap component of list item */
    listItemWrapperStyle?: StyleProp<ViewStyle>;

    /** Scroll event throttle for preventing onScroll callbacks to be fired too often */
    scrollEventThrottle?: number;

    /** Additional styles to apply to scrollable content */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Determines if the focused item should remain at the top of the viewable area when navigating with arrow keys */
    shouldKeepFocusedItemAtTopOfViewableArea?: boolean;

    /** Whether to debounce scrolling on focused index change */
    shouldDebounceScrolling?: boolean;

    /** Whether to prevent the active cell from being virtualized and losing focus in browsers */
    shouldPreventActiveCellVirtualization?: boolean;

    /** Whether to scroll to the focused index */
    shouldScrollToFocusedIndex?: boolean;

    /** Whether the layout is narrow */
    isSmallScreenWidth?: boolean;

    /** Called when scrollable content view of the ScrollView changes */
    onContentSizeChange?: (w: number, h: number) => void;

    /** Initial number of items to render */
    initialNumToRender?: number;

    /** Whether the screen is focused or not. (useIsFocused state does not work in tab screens, e.g. SearchPageBottomTab) */
    isScreenFocused?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;

    /** Number of items to render in the loader */
    fixedNumItemsForLoader?: number;

    /** Skeleton loader speed */
    loaderSpeed?: number;

    /** Error text to display */
    errorText?: string;

    /** Whether to show the default right hand side checkmark */
    shouldUseDefaultRightHandSideCheckmark?: boolean;

    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;

    /** Whether to hide the keyboard when scrolling a list */
    shouldHideKeyboardOnScroll?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<SelectionListHandle>;

    /** Custom scroll component to use instead of the default ScrollView */
    renderScrollComponent?: (props: ScrollViewProps) => ReactElement<ScrollViewProps, string | JSXElementConstructor<unknown>>;

    /** Whether to show the right caret icon */
    shouldShowRightCaret?: boolean;

    /** Whether to highlight the selected item */
    shouldHighlightSelectedItem?: boolean;

    /** Whether hover style should be disabled */
    shouldDisableHoverStyle?: boolean;
    setShouldDisableHoverStyle?: React.Dispatch<React.SetStateAction<boolean>>;

    /** When true, skips the contentHeaderHeight from the viewOffset calculation during scroll-to-index. Only needed on native platforms for split expense tabs (Amount/Percentage/Date) scroll correction. Web should always pass false. */
    shouldSkipContentHeaderHeightOffset?: boolean;
} & TRightHandSideComponent<TItem>;

type SelectionListHandle = {
    scrollAndHighlightItem?: (items: string[]) => void;
    clearInputAfterSelect?: () => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
    updateAndScrollToFocusedIndex: (newFocusedIndex: number, shouldSkipWhenIndexNonZero?: boolean) => void;
    updateExternalTextInputFocus: (isTextInputFocused: boolean) => void;
    getFocusedOption: () => ListItem | undefined;
    focusTextInput: () => void;
    scrollToFocusedInput: (index: number) => void;
};

type ItemLayout = {
    length: number;
    offset: number;
};

type FlattenedSectionsReturn<TItem extends ListItem> = {
    allOptions: TItem[];
    selectedOptions: TItem[];
    disabledOptionsIndexes: number[];
    disabledArrowKeyOptionsIndexes: number[];
    itemLayouts: ItemLayout[];
    allSelected: boolean;
    someSelected: boolean;
};

type UnreportedExpenseListItemType = Transaction & {
    isDisabled: boolean;
    keyForList: string;
    errors?: Errors;
};

type ButtonOrCheckBoxRoles = 'button' | 'checkbox';

type ExtendedSectionListData<TItem extends ListItem, TSection extends SectionWithIndexOffset<TItem>> = SectionListData<TItem, TSection> & {
    CustomSectionHeader?: ({section}: {section: TSection}) => ReactElement;
};

type SectionListDataType<TItem extends ListItem> = ExtendedSectionListData<TItem, SectionWithIndexOffset<TItem>>;

type SortableColumnName = SearchColumnType;

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType | ExpenseReportListItemType;

export type {
    BaseListItemProps,
    SelectionListProps,
    ButtonOrCheckBoxRoles,
    ExtendedTargetedEvent,
    FlattenedSectionsReturn,
    InviteMemberListItemProps,
    ListItem,
    ListItemProps,
    ListItemFocusEventHandler,
    RadioListItemProps,
    SingleSelectListItemProps,
    MultiSelectListItemProps,
    TransactionGroupListItemProps,
    TransactionGroupListExpandedProps,
    TransactionGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionCardGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionYearGroupListItemType,
    TransactionQuarterGroupListItemType,
    Section,
    SectionListDataType,
    SectionWithIndexOffset,
    SelectionListHandle,
    TableListItemProps,
    ExpenseReportListItemType,
    ExpenseReportListItemProps,
    TaskListItemType,
    TaskListItemProps,
    TransactionListItemProps,
    TransactionListItemType,
    TransactionSelectionListItem,
    UserListItemProps,
    UserSelectionListItemProps,
    ReportActionListItemType,
    ChatListItemProps,
    SortableColumnName,
    SearchListItem,
    UnreportedExpenseListItemType,
};
