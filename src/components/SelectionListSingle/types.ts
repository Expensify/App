import type {ReactElement, ReactNode, RefObject} from 'react';
import type {GestureResponderEvent, InputModeOptions, StyleProp, TextInput, TextStyle, ViewStyle} from 'react-native';
import type RadioListItem from '@components/SelectionList/RadioListItem';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

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

    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;
};

type ValidListItem = typeof RadioListItem;

type TextInputOptions = {
    /** Called when the text input value changes */
    onChangeText?: (text: string) => void;

    /** Label */
    textInputLabel?: string;

    /** Current value */
    textInputValue?: string;

    /** Hint text to display below */
    textInputHint?: string;

    /** Placeholder text */
    textInputPlaceholder?: string;

    /** Maximum number of characters allowed */
    textInputMaxLength?: number;

    /** Input mode e.g., 'text', 'email', 'numeric') */
    inputMode?: InputModeOptions;

    /** Error text to display below */
    textInputErrorText?: string;

    /** Reference to the text input component */
    textInputRef?: RefObject<TextInput | null> | ((ref: TextInput | null) => void);
};

type ConfirmButtonOptions<TItem extends ListItem> = {
    /** Whether to show the confirm button */
    showButton?: boolean;

    /** Called when the button is pressed */
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined, option?: TItem) => void;

    /** Custom style for the button */
    style?: StyleProp<ViewStyle>;

    /** Text to display on the button */
    text?: string;

    /** Whether the button is disabled */
    isDisabled?: boolean;
};

type SelectionListProps<TItem extends ListItem> = {
    /** Array of items to display in the list */
    data: TItem[];

    /** Reference to the SelectionList component */
    ref?: React.Ref<SelectionListHandle>;

    /** Component to render for each list item */
    ListItem: ValidListItem;

    /** Configuration options for the text input */
    textInputOptions?: TextInputOptions;

    /** Key of the item to focus initially */
    initiallyFocusedItemKey?: string;

    /** Called when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Called when "Select All" button is pressed */
    onSelectAll?: () => void;

    /** Called when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Called when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;

    /** Called once when the scroll position gets within onEndReachedThreshold of the rendered content */
    onEndReached?: () => void;

    /** How far from the end the bottom edge of the list must be to trigger onEndReached */
    onEndReachedThreshold?: number;

    /** Configuration for the confirm button */
    confirmButtonConfig?: ConfirmButtonOptions<TItem>;

    /** Message to display in a header above the list */
    aboveListHeaderMessage?: string;

    /** Custom header content to render instead of the default select all header */
    customListHeader?: React.ReactNode;

    /** Custom content to display in the footer */
    footerContent?: React.ReactNode;

    /** Custom content to display when the list is empty */
    listEmptyContent?: React.JSX.Element | null | undefined;

    /** Custom content to display in the footer of list component */
    listFooterContent?: React.JSX.Element | null | undefined;

    /** Component to display on the right side of each item */
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;

    /** Number of lines to show for alternate text */
    alternateNumberOfSupportedLines?: number;

    /** Array of selected item keys */
    selectedItems?: string[];

    /** Styles to apply to the list */
    listStyle?: StyleProp<ViewStyle>;

    /** Styles applied for the title of the list item */
    listItemTitleStyles?: StyleProp<TextStyle>;

    /** Styles for the list item wrapper */
    listItemWrapperStyle?: StyleProp<ViewStyle>;

    /** Function that determines if an item is selected */
    isSelected?: (item: TItem) => boolean;

    /** Whether the layout is narrow */
    isSmallScreenWidth?: boolean;

    /** Whether new options are loading */
    isLoadingNewOptions?: boolean;

    /** Whether to wrap long text */
    isRowMultilineSupported?: boolean;

    /** Whether to add bottom safe area padding */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to show the empty list content */
    showListEmptyContent?: boolean;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** Whether to show the vertical scroll indicator */
    showScrollIndicator?: boolean;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Whether to use the user skeleton view */
    shouldUseUserSkeletonView?: boolean;

    /** Whether to clear the input when an item is selected */
    shouldClearInputOnSelect?: boolean;

    /** Whether tooltips should be shown */
    shouldShowTooltips?: boolean;

    /** Whether to ignore focus events */
    shouldIgnoreFocus?: boolean;

    /** Whether to scroll to the focused item */
    shouldScrollToFocusedIndex?: boolean;

    /** Whether to debounce scrolling on focused item change */
    shouldDebounceScrolling?: boolean;

    /** Whether to update the focused item on a row select */
    shouldUpdateFocusedIndex?: boolean;

    /** Whether to single execution onRowSelect to avoid double clicks on mobile app */
    shouldSingleExecuteRowSelect?: boolean;

    /** Whether to prevent default focus on row selection */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;
};

type SelectionListHandle = {
    /** Scrolls to and highlights the specified items */
    scrollAndHighlightItem: (items: string[]) => void;

    /** Scrolls to the item at the specified index */
    scrollToIndex: (index: number) => void;
};

type DataDetailsType<TItem extends ListItem> = {
    /** Array of all items in the list */
    data: TItem[];

    /** Array of currently selected items */
    selectedOptions: TItem[];

    /** Whether all selectable items are selected */
    allSelected: boolean;

    /** Whether some (but not all) selectable items are selected */
    someSelected: boolean;

    /** Array of indexes for disabled items */
    disabledIndexes: number[];

    /** Array of indexes for items disabled for arrow key navigation */
    disabledArrowKeyIndexes: number[];
};

export type {DataDetailsType, SelectionListHandle, SelectionListProps, ListItem, TextInputOptions, ValidListItem, ConfirmButtonOptions};
