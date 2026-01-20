import type {ReactElement, ReactNode} from 'react';
import type {AccessibilityState, BlurEvent, NativeSyntheticEvent, StyleProp, TargetedEvent, TextStyle, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';
// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';
import type CONST from '@src/CONST';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';
import type BaseListItem from './BaseListItem';
import type InviteMemberListItem from './InviteMemberListItem';
import type MultiSelectListItem from './MultiSelectListItem';
import type RadioListItem from './RadioListItem';
import type SingleSelectListItem from './SingleSelectListItem';
import type SpendCategorySelectorListItem from './SpendCategorySelectorListItem';
import type SplitListItem from './SplitListItem';
import type TableListItem from './TableListItem';
import type TravelDomainListItem from './TravelDomainListItem';
import type UserListItem from './UserListItem';
import type UserSelectionListItem from './UserSelectionListItem';

type ListItem<K extends string | number = string> = {
    /** Text to display */
    text?: string;

    /** Alternate text to display */
    alternateText?: string | null;

    /** Key used internally by React */
    keyForList: K;

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
    shouldShowRightCaret?: boolean;

    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;

    /** Used to initiate payment from search page */
    hash?: number;
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

    /** Accessibility State tells a person using either VoiceOver on iOS or TalkBack on Android the state of the element currently focused on */
    accessibilityState?: AccessibilityState;

    /** Whether to show the right caret icon */
    shouldShowRightCaret?: boolean;
} & TRightHandSideComponent<TItem>;

type ListItemFocusEventHandler = (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void;

type ExtendedTargetedEvent = TargetedEvent & {
    /** Provides information about the input device responsible for the event, or null if triggered programmatically, available in some browsers */
    sourceCapabilities?: {
        /** A boolean value that indicates whether the device dispatches touch events. */
        firesTouchEvents: boolean;
    };
};

type TRightHandSideComponent<TItem extends ListItem> = {
    /** Component to display on the right side */
    rightHandSideComponent?: ((item: TItem, isFocused?: boolean) => ReactElement | null | undefined) | ReactElement | null;
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
    keyForList: string;

    /**
     * Whether the focus on the element should be synchronized. For example it should be set to false when the text input above list items is currently focused.
     * When we type something into the text input, the first element found is focused, in this situation we should not synchronize the focus on the element because we will lose the focus from the text input.
     */
    shouldSyncFocus?: boolean;

    /** Whether to show RBR */
    shouldDisplayRBR?: boolean;

    /** Boolean whether to display the right icon */
    shouldShowRightCaret?: boolean;

    /** Styles applied for the title */
    titleStyles?: StyleProp<TextStyle>;

    /** Styles applied for the title container of the list item */
    titleContainerStyles?: StyleProp<ViewStyle>;

    /** Whether to show the default right hand side checkmark */
    shouldUseDefaultRightHandSideCheckmark?: boolean;

    /** Whether to highlight the selected item */
    shouldHighlightSelectedItem?: boolean;

    /** Index of the item in the list */
    index?: number;

    /** Callback when the input inside the item is focused (if input exists) */
    onInputFocus?: (item: TItem) => void;

    /** Callback when the input inside the item is blurred (if input exists) */
    onInputBlur?: (e: BlurEvent) => void;

    /** Whether to disable the hover style of the item */
    shouldDisableHoverStyle?: boolean;

    /** Whether to call stopPropagation on the mouseleave event in BaseListItem */
    shouldStopMouseLeavePropagation?: boolean;
};

type ValidListItem =
    | typeof BaseListItem
    | typeof InviteMemberListItem
    | typeof MultiSelectListItem
    | typeof RadioListItem
    | typeof SingleSelectListItem
    | typeof SpendCategorySelectorListItem
    | typeof SplitListItem
    | typeof TableListItem
    | typeof TravelDomainListItem
    | typeof UserListItem
    | typeof UserSelectionListItem;

type BaseListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    item: TItem;
    shouldPreventDefaultFocusOnSelectRow?: boolean;
    shouldPreventEnterKeySubmit?: boolean;
    shouldShowBlueBorderOnFocus?: boolean;
    keyForList: string;
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
    /** Whether to show the right caret icon */
    shouldShowRightCaret?: boolean;
    /** Whether to highlight the selected item */
    shouldHighlightSelectedItem?: boolean;

    /** Whether to disable the hover style of the item */
    shouldDisableHoverStyle?: boolean;

    /** Whether to call stopPropagation on the mouseleave event in BaseListItem */
    shouldStopMouseLeavePropagation?: boolean;
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

        /** Indicates whether a split wasn't approved, paid etc. when report.statusNum < CONST.REPORT.STATUS_NUM.CLOSED */
        isEditable: boolean;

        /** Current mode for the split editor: amount or percentage */
        mode: ValueOf<typeof CONST.TAB.SPLIT>;

        /** Percentage value to show when in percentage mode (0-100) */
        percentage: number;

        /**
         * Function for updating value (amount or percentage based on mode)
         */
        onSplitExpenseValueChange: (transactionID: string, value: number, mode: ValueOf<typeof CONST.TAB.SPLIT>) => void;

        onInputFocus?: (item: SplitListItemType) => void;
    };

type SplitListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type RadioListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type SingleSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type MultiSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type SpendCategorySelectorListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> & ForwardedFSClassProps;

type TableListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type InviteMemberListItemProps<TItem extends ListItem> = UserListItemProps<TItem> & {
    /** Whether product training tooltips can be displayed */
    canShowProductTrainingTooltip?: boolean;
    index?: number;
    sectionIndex?: number;
};

type WorkspaceListItemType = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
    brickRoadIndicator?: BrickRoad;
} & ListItem;

type TravelDomainListItemProps<TItem extends ListItem> = BaseListItemProps<
    TItem & {
        /** Value of the domain */
        value?: string;

        /** Should display tag 'Recommended' */
        isRecommended?: boolean;
    }
>;

type UserSelectionListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

export type {
    BaseListItemProps,
    ExtendedTargetedEvent,
    ListItem,
    ListItemProps,
    ListItemFocusEventHandler,
    RadioListItemProps,
    ValidListItem,
    SingleSelectListItemProps,
    MultiSelectListItemProps,
    TravelDomainListItemProps,
    SpendCategorySelectorListItemProps,
    UserListItemProps,
    InviteMemberListItemProps,
    SplitListItemType,
    SplitListItemProps,
    TableListItemProps,
    WorkspaceListItemType,
    UserSelectionListItemProps,
};
