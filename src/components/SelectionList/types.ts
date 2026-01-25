import type {ReactElement, RefObject} from 'react';
import type {GestureResponderEvent, InputModeOptions, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {ListItem, ValidListItem} from './ListItem/types';

/**
 * Base props shared between SelectionList and SelectionListWithSections.
 * Contains common configuration for list behavior, styling, and callbacks.
 */
type BaseSelectionListProps<TItem extends ListItem> = {
    /** Component to render for each list item */
    ListItem: ValidListItem;

    /** Key of the item to focus initially */
    initiallyFocusedItemKey?: string;

    /** Called when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Custom content to display in the footer */
    footerContent?: React.ReactNode;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** Component to display on the right side of each item */
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;

    /** Whether tooltips should be shown */
    shouldShowTooltips?: boolean;

    /** Called when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Whether to prevent default focus on row selection */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to single execution onRowSelect to avoid double clicks on mobile app */
    shouldSingleExecuteRowSelect?: boolean;

    /** Configuration options for the text input */
    textInputOptions?: TextInputOptions;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Whether new options are loading */
    isLoadingNewOptions?: boolean;

    /** Custom content to display when the list is empty */
    listEmptyContent?: React.JSX.Element | null | undefined;

    /** Whether to show the empty list content */
    showListEmptyContent?: boolean;

    /** Whether to add bottom safe area padding */
    addBottomSafeAreaPadding?: boolean;

    /** Styles for the list */
    style?: SelectionListStyle;

    /** Whether to debounce scrolling on focused item change */
    shouldDebounceScrolling?: boolean;

    /** Whether to scroll to the focused item */
    shouldScrollToFocusedIndex?: boolean;

    /** Whether keyboard shortcuts should be disabled */
    disableKeyboardShortcuts?: boolean;

    /** Whether to stop automatic propagation on pressing enter key */
    shouldStopPropagation?: boolean;

    /** Called once when the scroll position gets within onEndReachedThreshold of the rendered content */
    onEndReached?: () => void;

    /** How far from the end the bottom edge of the list must be to trigger onEndReached */
    onEndReachedThreshold?: number;

    /** Whether scroll position should change when focused item changes */
    disableMaintainingScrollPosition?: boolean;

    /** Whether to update the focused item on a row select */
    shouldUpdateFocusedIndex?: boolean;

    /** Whether to ignore focus events */
    shouldIgnoreFocus?: boolean;

    /** Called when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;
};

/**
 * Props specific to the flat SelectionList component (without sections).
 * Extends BaseSelectionListProps with additional features like select all,
 * long press, confirm button, and more advanced customization options.
 */
type SelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> &
    BaseSelectionListProps<TItem> & {
        /** Array of items to display in the list */
        data: TItem[];

        /** Reference to the SelectionList component */
        ref?: React.Ref<SelectionListHandle<TItem>>;

        /** Called when "Select All" button is pressed */
        onSelectAll?: () => void;

        /** Callback to fire when the item is long pressed */
        onLongPressRow?: (item: TItem) => void;

        /** Configuration for the confirm button */
        confirmButtonOptions?: ConfirmButtonOptions<TItem>;

        /** Custom header content to render instead of the default select all header */
        customListHeader?: React.ReactNode;

        /** Custom content to display in the header of list component. */
        customListHeaderContent?: React.JSX.Element | null;

        /** Custom component to render while data is loading */
        customLoadingPlaceholder?: React.JSX.Element;

        /** Custom content to display in the footer of list component */
        listFooterContent?: React.JSX.Element | null | undefined;

        /** Number of lines to show for alternate text */
        alternateNumberOfSupportedLines?: number;

        /** Array of selected item keys */
        selectedItems?: readonly string[];

        /** Function that determines if an item is selected */
        isSelected?: (item: TItem) => boolean;

        /** Whether the whole list is disabled */
        isDisabled?: boolean;

        /** Whether the layout is narrow */
        isSmallScreenWidth?: boolean;

        /** Whether to wrap long text */
        isRowMultilineSupported?: boolean;

        /** Whether to show the vertical scroll indicator */
        showScrollIndicator?: boolean;

        /** Whether to use the user skeleton view */
        shouldUseUserSkeletonView?: boolean;

        /** Whether to show the right caret icon */
        shouldShowRightCaret?: boolean;

        /** Whether to place customListHeader in the list so it scrolls with data */
        shouldHeaderBeInsideList?: boolean;

        /** Whether to clear the text input when a row is selected */
        shouldClearInputOnSelect?: boolean;

        /** Whether to highlight the selected item */
        shouldHighlightSelectedItem?: boolean;

        /** Whether to show the default right hand side checkmark */
        shouldUseDefaultRightHandSideCheckmark?: boolean;

        /** Whether hover style should be disabled */
        shouldDisableHoverStyle?: boolean;

        /** Whether to set the hover style */
        setShouldDisableHoverStyle?: React.Dispatch<React.SetStateAction<boolean>>;
    };

type SelectionListStyle = {
    /** Styles for the list */
    listStyle?: StyleProp<ViewStyle>;

    /** Styles for the list container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the title of the list item */
    listItemTitleStyles?: StyleProp<TextStyle>;

    /** Styles for the list item wrapper */
    listItemWrapperStyle?: StyleProp<ViewStyle>;

    /** Styles for the list header wrapper */
    listHeaderWrapperStyle?: StyleProp<ViewStyle>;

    /** Styles for the title container of the list item */
    listItemTitleContainerStyles?: StyleProp<ViewStyle>;

    /** Styles for the section titles */
    sectionTitleStyles?: StyleProp<TextStyle>;
};

type TextInputOptions = {
    /** Called when the text input value changes */
    onChangeText?: (text: string) => void;

    /** Label */
    label?: string;

    /** Current value */
    value?: string;

    /** Hint text to display below */
    hint?: string;

    /** Header displayed with text input */
    headerMessage?: string;

    /** Placeholder text */
    placeholder?: string;

    /** Maximum number of characters allowed */
    maxLength?: number;

    /** Input mode e.g., 'text', 'email', 'numeric') */
    inputMode?: InputModeOptions;

    /** Error text to display below */
    errorText?: string;

    /** Whether the text input should be shown as a header inside list */
    shouldBeInsideList?: boolean;

    /** Whether the text input autofocus should be disabled */
    disableAutoFocus?: boolean;

    /** Styles for the text input */
    style?: {
        /** Styles for the text input container */
        containerStyle?: StyleProp<ViewStyle>;

        /** Styles for the header message container */
        headerMessageStyle?: StyleProp<ViewStyle>;
    };

    /** Reference to the text input component */
    ref?: RefObject<BaseTextInputRef | null>;
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

type ButtonOrCheckBoxRoles = 'button' | 'checkbox';

type SelectionListHandle<TItem extends ListItem> = {
    /** Scrolls to and highlights the specified items */
    scrollAndHighlightItem: (items: string[]) => void;

    /** Scrolls to the item at the specified index */
    scrollToIndex: (index: number) => void;

    /** Updates the focused index and optionally scrolls to it */
    updateFocusedIndex: (newFocusedIndex: number, shouldScroll?: boolean) => void;

    /** Scrolls to the focused input on SplitExpensePage */
    scrollToFocusedInput: (item: TItem) => void;

    /** Sets the focus to the textInput component */
    focusTextInput: () => void;
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

export type {BaseSelectionListProps, DataDetailsType, SelectionListHandle, SelectionListProps, TextInputOptions, ConfirmButtonOptions, ListItem, ButtonOrCheckBoxRoles, SelectionListStyle};
