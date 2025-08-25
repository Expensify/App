import type {ReactElement, ReactNode, RefObject} from 'react';
import type {GestureResponderEvent, InputModeOptions, NativeSyntheticEvent, StyleProp, TargetedEvent, TextInput, TextStyle, ViewStyle} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {SearchRouterItem} from '@components/Search/SearchAutocompleteList';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import type ChatListItem from '@components/SelectionList/ChatListItem';
import type InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type RadioListItem from '@components/SelectionList/RadioListItem';
import type SearchQueryListItem from '@components/SelectionList/Search/SearchQueryListItem';
import type TransactionGroupListItem from '@components/SelectionList/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type TableListItem from '@components/SelectionList/TableListItem';
import type TravelDomainListItem from '@components/SelectionList/TravelDomainListItem';
import type UserListItem from '@components/SelectionList/UserListItem';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import type UnreportedExpenseListItem from '@pages/UnreportedExpenseListItem';
import type SpendCategorySelectorListItem from '@pages/workspace/categories/SpendCategorySelectorListItem';
// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';
import type CONST from '@src/CONST';
import type {Policy, Report, TransactionViolation} from '@src/types/onyx';
import type {Attendee, SplitExpense} from '@src/types/onyx/IOU';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {SearchCard, SearchPersonalDetails, SearchReport, SearchReportAction, SearchTask, SearchTransaction} from '@src/types/onyx/SearchResults';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';

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
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

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
    onLongPressRow?: (item: TItem) => void;
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
    errors?: Errors;

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
};

type TransactionListItemType = ListItem &
    SearchTransaction & {
        /** The personal details of the user requesting money */
        from: SearchPersonalDetails;

        /** The personal details of the user paying the request */
        to: SearchPersonalDetails;

        /** final and formatted "from" value used for displaying and sorting */
        formattedFrom: string;

        /** final and formatted "to" value used for displaying and sorting */
        formattedTo: string;

        /** final and formatted "total" value used for displaying and sorting */
        formattedTotal: number;

        /** final and formatted "merchant" value used for displaying and sorting */
        formattedMerchant: string;

        /** final "date" value used for sorting */
        date: string;

        /** Whether we should show the merchant column */
        shouldShowMerchant: boolean;

        /** Whether we should show the category column */
        shouldShowCategory: boolean;

        /** Whether we should show the tag column */
        shouldShowTag: boolean;

        /** Whether we should show the tax column */
        shouldShowTax: boolean;

        /** Whether we should show the transaction year.
         * This is true if at least one transaction in the dataset was created in past years
         */
        shouldShowYear: boolean;

        isAmountColumnWide: boolean;

        isTaxAmountColumnWide: boolean;

        /** Key used internally by React */
        keyForList: string;

        /** Attendees in the transaction */
        attendees?: Attendee[];

        /** Precomputed violations */
        violations?: TransactionViolation[];
    };

type ReportActionListItemType = ListItem &
    SearchReportAction & {
        /** The personal details of the user posting comment */
        from: SearchPersonalDetails;

        /** final and formatted "from" value used for displaying and sorting */
        formattedFrom: string;

        /** final "date" value used for sorting */
        date: string;

        /** Key used internally by React */
        keyForList: string;
    };

type TaskListItemType = ListItem &
    SearchTask & {
        /** The personal details of the user who is assigned to the task */
        assignee: SearchPersonalDetails;

        /** The personal details of the user who created the task */
        createdBy: SearchPersonalDetails;

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

type TransactionGroupListItemType = ListItem & {
    /** List of grouped transactions */
    transactions: TransactionListItemType[];
};

type TransactionReportGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.REPORTS} & SearchReport & {
        /** The personal details of the user requesting money */
        from: SearchPersonalDetails;

        /** The personal details of the user paying the request */
        to: SearchPersonalDetails;
    };

type TransactionMemberGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.MEMBERS} & SearchPersonalDetails;

type TransactionCardGroupListItemType = TransactionGroupListItemType & {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARDS} & SearchPersonalDetails & SearchCard;

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
};

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
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

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Errors that this user may contain */
    errors?: Errors | ReceiptErrors | null;

    /** The type of action that's pending  */
    pendingAction?: PendingAction | null;

    /** The React element that will be shown as a footer */
    FooterComponent?: ReactElement;
};

type SplitListItemType = ListItem &
    SplitExpense & {
        /** Item header text */
        headerText: string;

        /** Merchant or vendor name */
        merchant: string;

        /** Currency code */
        currency: string;

        /** ID of split expense */
        transactionID: string;

        /** Currency symbol */
        currencySymbol: string;

        /** Original amount before split */
        originalAmount: number;

        /** Indicates whether a split was opened through this transaction */
        isTransactionLinked: boolean;

        /** Function for updating amount */
        onSplitExpenseAmountChange: (currentItemTransactionID: string, value: number) => void;
    };

type SplitListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TransactionSelectionListItem<TItem extends ListItem> = ListItemProps<TItem> & Transaction;

type InviteMemberListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

type UserSelectionListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

type RadioListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type SingleSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type MultiSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TableListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TransactionListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Whether the item's action is loading */
    isLoading?: boolean;
};

type TaskListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Whether the item's action is loading */
    isLoading?: boolean;
};

type TransactionGroupListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    groupBy?: SearchGroupBy;
};

type ChatListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    queryJSONHash?: number;

    /** The policies which the user has access to */
    policies?: OnyxCollection<Policy>;

    /** All the data of the report collection */
    allReports?: OnyxCollection<Report>;
};

// eslint-disable-next-line rulesdir/no-inline-named-export
export type ValidListItem =
    | typeof RadioListItem
    | typeof UserListItem
    | typeof TableListItem
    | typeof InviteMemberListItem
    | typeof TransactionListItem
    | typeof TransactionGroupListItem
    | typeof ChatListItem
    | typeof SearchQueryListItem
    | typeof SearchRouterItem
    | typeof TravelDomainListItem
    | typeof UnreportedExpenseListItem
    | typeof SpendCategorySelectorListItem;

type SelectionListProps<TItem extends ListItem> = {
    ref?: React.Ref<SelectionListHandle>;
    data: TItem[];
    ListItem: ValidListItem;
    onSelectRow: (item: TItem) => void;
    onSelectAll?: () => void;
    onCheckboxPress?: (item: TItem) => void;
    showLoadingPlaceholder?: boolean;
    showListEmptyContent?: boolean;
    shouldUseUserSkeletonView?: boolean;
    listEmptyContent?: React.JSX.Element | null | undefined;
    addBottomSafeAreaPadding?: boolean;
    footerContent?: React.ReactNode;
    onConfirm?: ((e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem | undefined) => void) | undefined;
    confirmButtonStyle?: StyleProp<ViewStyle>;
    confirmButtonText?: string;
    isConfirmButtonDisabled?: boolean;
    listFooterContent?: React.JSX.Element | null | undefined;
    showScrollIndicator?: boolean;
    onEndReached?: () => void;
    onEndReachedThreshold?: number;
    listStyle?: StyleProp<ViewStyle>;
    isLoadingNewOptions?: boolean;
    shouldShowTextInput?: boolean;
    textInputOptions?: {
        onChangeText?: (text: string) => void;
        textInputLabel?: string;
        textInputValue?: string;
        textInputHint?: string;
        textInputPlaceholder?: string;
        textInputMaxLength?: number;
        inputMode?: InputModeOptions;
        textInputErrorText?: string;
        textInputRef?: RefObject<TextInput | null> | ((ref: TextInput | null) => void);
    };
    canSelectMultiple?: boolean;
    shouldShowTooltips?: boolean;
    selectedItems?: string[];
    isSelected?: (item: TItem) => boolean;
    shouldSingleExecuteRowSelect?: boolean;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;
    shouldIgnoreFocus?: boolean;
    listItemWrapperStyle?: StyleProp<ViewStyle>;
    isRowMultilineSupported?: boolean;
    alternateTextNumberOfSupportedLines?: number;
    listItemTitleStyles?: StyleProp<TextStyle>;
    headerMessage?: string;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndex?: boolean;
    shouldDebounceScrolling?: boolean;
    isSmallScreenWidth?: boolean;
    shouldClearInputOnSelect?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    listHeaderContent?: React.ReactNode;
    customListHeader?: React.ReactNode;
};

type SelectionListHandle = {
    scrollAndHighlightItem: (items: string[]) => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
    focusTextInput: () => void;
};

type DataDetailsType<TItem extends ListItem> = {
    allOptions: TItem[];
    selectedOptions: TItem[];
    allSelected: boolean;
    someSelected: boolean;
    disabledIndexes: number[];
    disabledArrowKeyIndexes: number[];
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

type SortableColumnName = SearchColumnType | typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS;

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType;

export type {
    DataDetailsType,
    SelectionListHandle,
    SelectionListProps,
    //
    BaseListItemProps,
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
    TransactionGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionCardGroupListItemType,
    TableListItemProps,
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
    SplitListItemProps,
    SplitListItemType,
    SearchListItem,
    UnreportedExpenseListItemType,
};
