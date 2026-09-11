import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ReactElement, Ref} from 'react';
import type {GestureResponderEvent, InputModeOptions, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import type {ListItem, ValidListItem} from './ListItem/types';
import type {SelectionListWithSectionsHandle, SelectionListWithSectionsProps} from './SelectionListWithSections/types';

/**
 * Base props shared between SelectionList and SelectionListWithSections.
 * Contains common configuration for list behavior, styling, and callbacks.
 */
type BaseSelectionListProps<TItem extends ListItem> = {
    ListItem: ValidListItem;
    initiallyFocusedItemKey?: string;
    onSelectRow: (item: TItem) => void;
    canSelectMultiple?: boolean;
    footerContent?: React.ReactNode;
    listFooterContent?: React.JSX.Element | null | undefined;
    shouldShowLoadingPlaceholder?: boolean;
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;
    shouldShowTooltips?: boolean;
    customListHeaderContent?: React.JSX.Element | null;
    onSelectionButtonPress?: (item: TItem) => void;
    onDismissError?: (item: TItem) => void;
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to single execution onRowSelect to avoid double clicks on mobile app */
    shouldSingleExecuteRowSelect?: boolean;

    /** Configuration options for the text input */
    textInputOptions?: TextInputOptions;

    /** Search value used for focus synchronization. Defaults to textInputOptions.value */
    searchValueForFocusSync?: string;

    shouldShowTextInput?: boolean;
    isLoadingNewOptions?: boolean;
    listEmptyContent?: React.JSX.Element | null | undefined;
    shouldShowListEmptyContent?: boolean;
    addBottomSafeAreaPadding?: boolean;
    style?: SelectionListStyle;

    /** Whether to debounce scrolling on focused item change */
    shouldDebounceScrolling?: boolean;

    shouldScrollToFocusedIndex?: boolean;

    /** Whether to scroll to the focused item on mount. When false, the list stays at the top to keep header content visible */
    shouldScrollToFocusedIndexOnMount?: boolean;

    /** Whether to visually highlight the initially focused item before any keyboard interaction */
    shouldHighlightInitiallyFocusedItem?: boolean;

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

    onScrollBeginDrag?: () => void;

    /** Configuration for the confirm button */
    confirmButtonOptions?: ConfirmButtonOptions<TItem>;

    /** Whether to clear the text input when a row is selected */
    shouldClearInputOnSelect?: boolean;

    shouldDisableHoverStyle?: boolean;
    setShouldDisableHoverStyle?: React.Dispatch<React.SetStateAction<boolean>>;

    /** Which side of the row to render the selection button on */
    selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;

    shouldHighlightSelectedItem?: boolean;
};

/**
 * Props specific to the flat SelectionList component (without sections).
 * Extends BaseSelectionListProps with additional features like select all,
 * long press, confirm button, and more advanced customization options.
 */
type SelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> &
    BaseSelectionListProps<TItem> & {
        data: TItem[];
        ref?: React.Ref<SelectionListHandle<TItem>>;

        /** Called when "Select All" button is pressed */
        onSelectAll?: () => void;

        onLongPressRow?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

        /** Custom header content to render instead of the default select all header */
        customListHeader?: React.ReactNode;

        customLoadingPlaceholder?: React.JSX.Element;

        /** Number of lines to show for alternate text */
        alternateNumberOfSupportedLines?: number;

        /** Array of selected item keys */
        selectedItems?: readonly string[];

        isSelected?: (item: TItem) => boolean;
        isDisabled?: boolean;

        /** Whether the layout is narrow */
        isSmallScreenWidth?: boolean;

        /** Whether to wrap long text */
        isRowMultilineSupported?: boolean;

        /** Whether to show the vertical scroll indicator */
        showScrollIndicator?: boolean;

        shouldUseUserSkeletonView?: boolean;

        /** Whether to show the right caret icon */
        shouldShowRightCaret?: boolean;

        /** Whether to place customListHeader in the list so it scrolls with data */
        shouldHeaderBeInsideList?: boolean;

        /** Custom accessibility label for the select all checkbox, providing context about what is being selected */
        selectAllAccessibilityLabel?: string;
    };

type SelectionListStyle = {
    listStyle?: StyleProp<ViewStyle>;

    /** Styles for the content container of the list (scrolls with content) */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Styles for the list footer content container */
    listFooterContentStyle?: StyleProp<ViewStyle>;

    containerStyle?: StyleProp<ViewStyle>;
    listItemTitleStyles?: StyleProp<TextStyle>;
    listItemWrapperStyle?: StyleProp<ViewStyle>;
    listHeaderWrapperStyle?: StyleProp<ViewStyle>;

    /** Styles for the default "Select all" label in the list header (merged after textStrong) */
    listHeaderSelectAllTextStyle?: StyleProp<TextStyle>;

    listItemTitleContainerStyles?: StyleProp<ViewStyle>;
    listItemErrorRowStyles?: StyleProp<ViewStyle>;
    sectionTitleStyles?: StyleProp<TextStyle>;
};

type TextInputOptions = {
    /** Called when the text input value changes */
    onChangeText?: (text: string) => void;

    label?: string;
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

    errorText?: string;

    /** Whether the text input should be shown as a header inside list */
    shouldBeInsideList?: boolean;

    /** Whether the text input autofocus should be disabled */
    disableAutoFocus?: boolean;

    /** Whether the text input auto correct should be disabled */
    disableAutoCorrect?: boolean;

    /** Whether the text input should intercept swipes */
    shouldInterceptSwipe?: boolean;

    /** Styles for the text input */
    style?: {
        /** Styles for the text input container */
        containerStyle?: StyleProp<ViewStyle>;

        /** Styles for the header message container */
        headerMessageStyle?: StyleProp<ViewStyle>;
    };

    ref?: Ref<BaseTextInputRef | null>;
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

    /**
     * Visual size of the footer confirm button (SelectionList Footer only).
     * Defaults to large for backwards compatibility.
     */
    confirmButtonSize?: 'large' | 'medium' | 'small';

    /**
     * Whether a custom footer confirm control can handle a plain Enter key on the current platform.
     * Defaults to `true` — footers built with an unconditional `<Button.KeyboardShortcut />` are Enter-capable everywhere.
     * Pass `false` when the footer is intentionally unable to handle Enter on a platform.
     */
    isFooterConfirmEnterKeyEnabled?: boolean;

    /**
     * Whether a custom footer confirm control is currently rendered and enabled.
     * Defaults to inferring the state from the rendered rows. Pass the authoritative state when the footer's
     * enabled state depends on selection that may not be reflected in the currently rendered rows.
     */
    isFooterConfirmEnabled?: boolean;
};

type SelectionListHandle<TItem extends ListItem> = {
    scrollAndHighlightItem: (items: string[]) => void;
    scrollToIndex: (index: number) => void;

    /** Updates the focused index and optionally scrolls to it */
    updateFocusedIndex: (newFocusedIndex: number, shouldScroll?: boolean) => void;

    /** Scrolls to the focused input on SplitExpensePage */
    scrollToFocusedInput: (item: TItem) => void;

    focusTextInput: () => void;
};

type DataDetailsType<TItem extends ListItem> = {
    data: TItem[];
    selectedOptions: TItem[];
    allSelected: boolean;

    /** Whether some (but not all) selectable items are selected */
    someSelected: boolean;

    disabledIndexes: number[];

    /** Array of indexes for items disabled for arrow key navigation */
    disabledArrowKeyIndexes: number[];
};

export type {
    BaseSelectionListProps,
    DataDetailsType,
    SelectionListHandle,
    SelectionListProps,
    TextInputOptions,
    ConfirmButtonOptions,
    ListItem,
    SelectionListStyle,
    SelectionListWithSectionsHandle,
    SelectionListWithSectionsProps,
};
