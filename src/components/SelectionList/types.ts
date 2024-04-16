import type {MutableRefObject, ReactElement, ReactNode} from 'react';
import type {GestureResponderEvent, InputModeOptions, LayoutChangeEvent, SectionListData, StyleProp, TextInput, TextStyle, ViewStyle} from 'react-native';
import type {MaybePhraseKey} from '@libs/Localize';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
import type CONST from '@src/CONST';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type IconAsset from '@src/types/utils/IconAsset';
import type InviteMemberListItem from './InviteMemberListItem';
import type RadioListItem from './RadioListItem';
import type TableListItem from './TableListItem';
import type UserListItem from './UserListItem';

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

    /** Component to display on the right side */
    rightHandSideComponent?: ((item: TItem) => ReactElement<TItem> | null) | ReactElement | null;

    /** Styles for the pressable component */
    pressableStyle?: StyleProp<ViewStyle>;

    /** Styles for the wrapper view */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Styles for the container view */
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the checkbox wrapper view if select multiple option is on */
    selectMultipleStyle?: StyleProp<ViewStyle>;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Handles what to do when the item is focused */
    onFocus?: () => void;
};

type ListItem = {
    /** Text to display */
    text?: string;

    /** Alternate text to display */
    alternateText?: string | null;

    /** Key used internally by React */
    keyForList?: string | null;

    /** Whether this option is selected */
    isSelected?: boolean;

    /** Whether the checkbox should be disabled */
    isDisabledCheckbox?: boolean;

    /** Whether this option is disabled for selection */
    isDisabled?: boolean | null;

    /** List title is bold by default. Use this props to customize it */
    isBold?: boolean;

    /** User accountID */
    accountID?: number | null;

    /** User login */
    login?: string | null;

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

    /** Whether this option should show subscript */
    shouldShowSubscript?: boolean | null;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** The search value from the selection list */
    searchText?: string | null;

    /** What text to show inside the badge (if none present the badge will be omitted) */
    badgeText?: string;

    brickRoadIndicator?: BrickRoad | '' | null;
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

    /** Key used internally by React */
    keyForList?: string;
};

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    item: TItem;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    keyForList?: string | null;
    errors?: Errors | ReceiptErrors | null;
    pendingAction?: PendingAction | null;
    FooterComponent?: ReactElement;
    children?: ReactElement<ListItemProps<TItem>> | ((hovered: boolean) => ReactElement<ListItemProps<TItem>>);
    hoverStyle?: StyleProp<ViewStyle>;
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

type ValidListItem = typeof RadioListItem | typeof UserListItem | typeof TableListItem | typeof InviteMemberListItem;

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
    indexOffset: number;
};

type BaseSelectionListProps<TItem extends ListItem> = Partial<ChildrenProps> & {
    /** Sections for the section list */
    sections: Array<SectionListData<TItem, Section<TItem>>> | typeof CONST.EMPTY_ARRAY;

    /** Default renderer for every item in the list */
    ListItem: ValidListItem;

    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: TItem) => void;

    /** Optional callback function triggered upon pressing a checkbox. If undefined and the list displays checkboxes, checkbox interactions are managed by onSelectRow, allowing for pressing anywhere on the list. */
    onCheckboxPress?: (item: TItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onSelectAll?: () => void;

    /** Callback to fire when an error is dismissed */
    onDismissError?: (item: TItem) => void;

    /** Label for the text input */
    textInputLabel?: string;

    /** Placeholder for the text input */
    textInputPlaceholder?: string;

    /** Hint for the text input */
    textInputHint?: MaybePhraseKey;

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

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey?: string | null;

    /** Callback to fire when the list is scrolled */
    onScroll?: () => void;

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

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether focus event should be delayed */
    shouldDelayFocus?: boolean;

    /** Component to display on the right side of each child */
    rightHandSideComponent?: ((item: TItem) => ReactElement<TItem> | null) | ReactElement | null;

    /** Whether to show the loading indicator for new options */
    isLoadingNewOptions?: boolean;

    /** Fired when the list is displayed with the items */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** Custom header to show right above list */
    customListHeader?: ReactNode;

    /** Styles for the list header wrapper */
    listHeaderWrapperStyle?: StyleProp<ViewStyle>;

    /** Whether to wrap long text up to 2 lines */
    isRowMultilineSupported?: boolean;

    /** Ref for textInput */
    textInputRef?: MutableRefObject<TextInput | null> | ((ref: TextInput | null) => void);

    /** Styles for the section title */
    sectionTitleStyles?: StyleProp<ViewStyle>;

    /**
     * When true, the list won't be visible until the list layout is measured. This prevents the list from "blinking" as it's scrolled to the bottom which is recommended for large lists.
     * When false, the list will render immediately and scroll to the bottom which works great for small lists.
     */
    shouldHideListOnInitialRender?: boolean;
};

type SelectionListHandle = {
    scrollAndHighlightItem?: (items: string[], timeout: number) => void;
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

type SectionListDataType<TItem extends ListItem> = SectionListData<TItem, SectionWithIndexOffset<TItem>>;

export type {
    BaseSelectionListProps,
    CommonListItemProps,
    Section,
    SectionWithIndexOffset,
    BaseListItemProps,
    UserListItemProps,
    RadioListItemProps,
    TableListItemProps,
    InviteMemberListItemProps,
    ListItem,
    ListItemProps,
    FlattenedSectionsReturn,
    ItemLayout,
    ButtonOrCheckBoxRoles,
    SectionListDataType,
    SelectionListHandle,
    ValidListItem,
};
