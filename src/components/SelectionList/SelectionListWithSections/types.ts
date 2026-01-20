import type {ReactElement, ReactNode} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ListItem, ValidListItem} from '@components/SelectionList/ListItem/types';
import type {SelectionListStyle, TextInputOptions} from '@components/SelectionList/types';

type Section<TItem extends ListItem> = {
    /** Title of the section */
    title?: string;

    /** Array of items in the section */
    data?: TItem[];

    /** Whether this section is disabled */
    isDisabled?: boolean;
};

type SelectionListWithSectionsProps<TItem extends ListItem> = {
    /** Reference to the SelectionList component */
    ref?: React.Ref<SelectionWithSectionsListHandle>;

    /** Array of sections to display in the list */
    sections: Array<Section<TItem>>;

    /** Component to render for each list item */
    ListItem: ValidListItem;

    /** Called when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Key of the item to focus initially */
    initiallyFocusedOptionKey?: string | null;

    /** Custom content to display in the header */
    customHeaderContent?: ReactNode;

    /** Custom content to display in the footer */
    footerContent?: ReactNode;

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

    /** Whether to single execution onRowSelect to avoid double clicks */
    shouldSingleExecuteRowSelect?: boolean;

    /** Configuration options for the text input */
    textInputOptions?: TextInputOptions;

    /** Whether to show the text input */
    shouldShowTextInput?: boolean;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Custom content to display when the list is empty */
    listEmptyContent?: React.JSX.Element;

    /** Whether to show the empty list content */
    shouldShowListEmptyContent?: boolean;

    /** Whether to add bottom safe area padding */
    addBottomSafeAreaPadding?: boolean;

    /** Styles for the list */
    style?: SelectionListStyle;

    /** Whether to debounce scrolling on focused index change */
    shouldDebounceScrolling?: boolean;

    /** Whether to scroll to the focused index */
    shouldScrollToFocusedIndex?: boolean;

    /** Whether keyboard shortcuts should be disabled */
    disableKeyboardShortcuts?: boolean;

    /** Whether to stop propagation on keyboard shortcuts */
    shouldStopPropagation?: boolean;

    /** Called once when the scroll position gets within onEndReachedThreshold of the rendered content. */
    onEndReached?: () => void;

    /**
     * How far from the end (in units of visible length of the list) the bottom edge of the
     * list must be from the end of the content to trigger the `onEndReached` callback.
     * Thus a value of 0.5 will trigger `onEndReached` when the end of the content is
     * within half the visible length of the list.
     */
    onEndReachedThreshold?: number;

    /** Whether to disable maintaining scroll position */
    disableMaintainingScrollPosition?: boolean;

    /** Whether to update the focused index */
    shouldUpdateFocusedIndex?: boolean;

    /** Whether to ignore the focus event */
    shouldIgnoreFocus?: boolean;

    /** Called when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;
};

type SelectionListWithSectionsStyle = {
    /** Styles for the list */
    sectionListStyle?: StyleProp<ViewStyle>;

    /** Styles for the section titles */
    sectionTitleStyles?: StyleProp<TextStyle>;

    /** Styles for the list container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the header message */
    headerMessageStyle?: StyleProp<ViewStyle>;

    /** Styles for the list item title */
    listItemTitleStyles?: StyleProp<TextStyle>;

    /** Styles for the list item wrapper */
    listItemWrapperStyle?: StyleProp<ViewStyle>;
};

type SelectionWithSectionsListHandle = {
    focusTextInput: () => void;
};

type SectionHeader = {
    type: 'header';
    title: string;
    keyForList: string;
    isDisabled: boolean;
};

type SectionListItem<TItem extends ListItem> = TItem & {flatIndex: number; type: 'row'};

type FlattenedItem<TItem extends ListItem> = SectionListItem<TItem> | SectionHeader;

export type {Section, ListItem, SectionListItem, SelectionListWithSectionsProps, SelectionWithSectionsListHandle, SelectionListWithSectionsStyle, SectionHeader, FlattenedItem};
