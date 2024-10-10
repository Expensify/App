import type {MutableRefObject, ReactElement, ReactNode} from 'react';
import type {
    GestureResponderEvent,
    InputModeOptions,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    SectionListData,
    StyleProp,
    TextInput,
    TextStyle,
    ViewStyle,
} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {SearchRouterItem} from '@components/Search/SearchRouter/SearchRouterList';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';
import type CONST from '@src/CONST';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {SearchPersonalDetails, SearchReport, SearchReportAction, SearchTransaction} from '@src/types/onyx/SearchResults';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import type ChatListItem from './ChatListItem';
import type InviteMemberListItem from './InviteMemberListItem';
import type RadioListItem from './RadioListItem';
import type ReportListItem from './Search/ReportListItem';
import type SearchQueryListItem from './Search/SearchQueryListItem';
import type TransactionListItem from './Search/TransactionListItem';
import type TableListItem from './TableListItem';
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
    onFocus?: () => void;

    /** Callback to fire when the item is long pressed */
    onLongPressRow?: (item: TItem) => void;
} & TRightHandSideComponent<TItem>;

type ListItem = {
    /** Text to display */
    text?: string;

    /** Alternate text to display */
    alternateText?: string | null;

    /** Key used internally by React */
    keyForList?: string | null;

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

        /** Key used internally by React */
        keyForList: string;
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

type ReportListItemType = ListItem &
    SearchReport & {
        /** The personal details of the user requesting money */
        from: SearchPersonalDetails;

        /** The personal details of the user paying the request */
        to: SearchPersonalDetails;

        /** List of transactions that belong to this report */
        transactions: TransactionListItemType[];
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
};

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    item: TItem;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    shouldPreventEnterKeySubmit?: boolean;
    keyForList?: string | null;
    errors?: Errors | ReceiptErrors | null;
    pendingAction?: PendingAction | null;
    FooterComponent?: ReactElement;
    children?: ReactElement<ListItemProps<TItem>> | ((hovered: boolean) => ReactElement<ListItemProps<TItem>>);
    shouldSyncFocus?: boolean;
    hoverStyle?: StyleProp<ViewStyle>;
    /** Errors that this user may contain */
    shouldDisplayRBR?: boolean;
};

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Errors that this user may contain */
    errors?: Errors | ReceiptErrors | null;

    /** The type of action that's pending  */
    pendingAction?: PendingAction | null;

    /** The React element that will be shown as a footer */
    FooterComponent?: ReactElement;
};

type InviteMemberListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

type RadioListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TableListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type TransactionListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type ReportListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type ChatListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type ValidListItem =
    | typeof RadioListItem
    | typeof UserListItem
    | typeof TableListItem
    | typeof InviteMemberListItem
    | typeof TransactionListItem
    | typeof ReportListItem
    | typeof ChatListItem
    | typeof SearchQueryListItem
    | typeof SearchRouterItem;

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

type SectionWithIndexOffset<TItem extends ListItem> = Section<TItem> & {
    /** The initial index of this section given the total number of options in each section's data array */
    indexOffset?: number;
};

type SkeletonViewProps = {
    shouldAnimate: boolean;
};

type BaseSelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> & {
    /** Sections for the section list */
    sections: Array<SectionListDataType<TItem>> | typeof CONST.EMPTY_ARRAY;

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

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Label for the text input */
    textInputLabel?: string;

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

    /** Callback to fire when the list is scrolled */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Callback to fire when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;

    /** Message to display at the top of the list */
    headerMessage?: string;

    /** Styles to apply to the header message */
    headerMessageStyle?: StyleProp<ViewStyle>;

    /** Text to display on the confirm button */
    confirmButtonText?: string;

    /** Callback to fire when the confirm button is pressed */
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem) => void;

    /** Whether to show the vertical scroll indicator */
    showScrollIndicator?: boolean;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** Whether to show the default confirm button */
    showConfirmButton?: boolean;

    /** Whether tooltips should be shown */
    shouldShowTooltips?: boolean;

    /** Whether to stop automatic propagation on pressing enter key or not */
    shouldStopPropagation?: boolean;

    /** Whether to call preventDefault() on pressing enter key or not */
    shouldPreventDefault?: boolean;

    /** Whether to prevent default focusing of options and focus the textinput when selecting an option */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Custom content to display in the header */
    headerContent?: ReactNode;

    /** Custom content to display in the header of list component. */
    listHeaderContent?: React.JSX.Element | null;

    /** Custom content to display in the footer */
    footerContent?: ReactNode;

    /** Custom content to display in the footer of list component. If present ShowMore button won't be displayed */
    listFooterContent?: React.JSX.Element | null;

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
    textInputRef?: MutableRefObject<TextInput | null> | ((ref: TextInput | null) => void);

    /** Styles for the section title */
    sectionTitleStyles?: StyleProp<ViewStyle>;

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

    /** Scroll event throttle for preventing onScroll callbacks to be fired too often */
    scrollEventThrottle?: number;

    /** Additional styles to apply to scrollable content */
    contentContainerStyle?: StyleProp<ViewStyle>;
} & TRightHandSideComponent<TItem>;

type SelectionListHandle = {
    scrollAndHighlightItem?: (items: string[], timeout: number) => void;
    clearInputAfterSelect?: () => void;
    scrollToIndex: (index: number, animated?: boolean) => void;
    updateAndScrollToFocusedIndex: (newFocusedIndex: number) => void;
    updateExternalTextInputFocus: (isTextInputFocused: boolean) => void;
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
};

type ButtonOrCheckBoxRoles = 'button' | 'checkbox';

type ExtendedSectionListData<TItem extends ListItem, TSection extends SectionWithIndexOffset<TItem>> = SectionListData<TItem, TSection> & {
    CustomSectionHeader?: ({section}: {section: TSection}) => ReactElement;
};

type SectionListDataType<TItem extends ListItem> = ExtendedSectionListData<TItem, SectionWithIndexOffset<TItem>>;

export type {
    BaseListItemProps,
    BaseSelectionListProps,
    ButtonOrCheckBoxRoles,
    CommonListItemProps,
    FlattenedSectionsReturn,
    InviteMemberListItemProps,
    ItemLayout,
    ListItem,
    ListItemProps,
    RadioListItemProps,
    ReportListItemProps,
    ReportListItemType,
    Section,
    SkeletonViewProps,
    SectionListDataType,
    SectionWithIndexOffset,
    SelectionListHandle,
    TableListItemProps,
    TransactionListItemProps,
    TransactionListItemType,
    UserListItemProps,
    ValidListItem,
    ReportActionListItemType,
    ChatListItemProps,
};
