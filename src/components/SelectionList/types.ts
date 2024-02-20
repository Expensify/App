import type {ReactElement, ReactNode} from 'react';
import type {GestureResponderEvent, InputModeOptions, LayoutChangeEvent, SectionListData, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type CommonListItemProps<TItem> = {
    /** Whether this item is focused (for arrow key controls) */
    isFocused?: boolean;

    /** Style to be applied to Text */
    textStyles?: StyleProp<TextStyle>;

    /** Style to be applied on the alternate text */
    alternateTextStyles?: StyleProp<TextStyle>;

    /** Whether this item is disabled */
    isDisabled?: boolean;

    /** Whether this item should show Tooltip */
    showTooltip: boolean;

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple?: boolean;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Component to display on the right side */
    rightHandSideComponent?: ((item: TItem) => ReactElement<TItem>) | ReactElement | null;
};

type ListItem = {
    /** Text to display */
    text: string;

    /** Alternate text to display */
    alternateText?: string;

    /** Key used internally by React */
    keyForList: string;

    /** Whether this option is selected */
    isSelected?: boolean;

    /** Whether this option is disabled for selection */
    isDisabled?: boolean;

    /** User accountID */
    accountID?: number | null;

    /** User login */
    login?: string;

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

    /** Whether this option should show subscript */
    shouldShowSubscript?: boolean;
};

type ListItemProps = CommonListItemProps<ListItem> & {
    /** The section list item */
    item: ListItem;

    /** Additional styles to apply to text */
    style?: StyleProp<TextStyle>;

    /** Is item hovered */
    isHovered?: boolean;
};

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    item: TItem;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    keyForList?: string;
};

type Section<TItem extends ListItem> = {
    /** Title of the section */
    title?: string;

    /** The initial index of this section given the total number of options in each section's data array */
    indexOffset?: number;

    /** Array of options */
    data?: TItem[];

    /** Whether this section items disabled for selection */
    isDisabled?: boolean;

    /** Whether this section should be shown or not */
    shouldShow?: boolean;
};

type BaseSelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> & {
    /** Sections for the section list */
    sections: Array<SectionListData<TItem, Section<TItem>>>;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onSelectAll?: () => void;

    /** Callback to fire when an error is dismissed */
    onDismissError?: () => void;

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

    /** Callback to fire when the text input changes */
    onChangeText?: (text: string) => void;

    /** Input mode for the text input */
    inputMode?: InputModeOptions;

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string;

    /** Callback to fire when the list is scrolled */
    onScroll?: () => void;

    /** Callback to fire when the list is scrolled and the user begins dragging */
    onScrollBeginDrag?: () => void;

    /** Message to display at the top of the list */
    headerMessage?: string;

    /** Text to display on the confirm button */
    confirmButtonText?: string;

    /** Callback to fire when the confirm button is pressed */
    onConfirm?: (e?: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /** Whether to show the vertical scroll indicator */
    showScrollIndicator?: boolean;

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder?: boolean;

    /** Whether to show the default confirm button */
    showConfirmButton?: boolean;

    /** Whether tooltips should be shown */
    shouldShowTooltips?: boolean;

    /** Whether to stop automatic form submission on pressing enter key or not */
    shouldStopPropagation?: boolean;

    /** Whether to prevent default focusing of options and focus the textinput when selecting an option */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Custom content to display in the header */
    headerContent?: ReactNode;

    /** Custom content to display in the footer */
    footerContent?: ReactNode;

    /** Whether to use dynamic maxToRenderPerBatch depending on the visible number of elements */
    shouldUseDynamicMaxToRenderPerBatch?: boolean;

    /** Whether keyboard shortcuts should be disabled */
    disableKeyboardShortcuts?: boolean;

    /** Whether to disable initial styling for focused option */
    disableInitialFocusOptionStyle?: boolean;

    /** Styles to apply to SelectionList container */
    containerStyle?: ViewStyle;

    /** Whether keyboard is visible on the screen */
    isKeyboardShown?: boolean;

    /** Whether focus event should be delayed */
    shouldDelayFocus?: boolean;

    /** Component to display on the right side of each child */
    rightHandSideComponent?: ((item: TItem) => ReactElement<TItem>) | ReactElement | null;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Fired when the list is displayed with the items */
    onLayout?: (event: LayoutChangeEvent) => void;
};

type ItemLayout = {
    length: number;
    offset: number;
};

type FlattenedSectionsReturn<TItem extends ListItem> = {
    allOptions: TItem[];
    selectedOptions: TItem[];
    disabledOptionsIndexes: number[];
    itemLayouts: ItemLayout[];
    allSelected: boolean;
};

type ButtonOrCheckBoxRoles = 'button' | 'checkbox';

type SectionListDataType<TItem extends ListItem> = SectionListData<TItem, Section<TItem>>;

export type {
    BaseSelectionListProps,
    CommonListItemProps,
    Section,
    BaseListItemProps,
    ListItem,
    ListItemProps,
    FlattenedSectionsReturn,
    ItemLayout,
    ButtonOrCheckBoxRoles,
    SectionListDataType,
};
