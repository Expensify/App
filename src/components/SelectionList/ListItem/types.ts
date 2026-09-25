import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {SpendRuleSummaryPart} from '@libs/SpendRulesUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

import type CONST from '@src/CONST';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {ComponentType, PropsWithChildren, ReactNode} from 'react';
import type {NativeSyntheticEvent, Role, StyleProp, TargetedEvent, TextStyle, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type ListItem<K extends string | number = string> = {
    text?: string;
    alternateText?: string | null;

    /** Custom node rendered in place of the alternate text (e.g. a description containing an inline link). Takes precedence over `alternateText` when set. */
    alternateTextComponent?: ReactNode;

    /** Accessibility label for screen readers */
    accessibilityLabel?: string;

    /** Key used internally by React */
    keyForList: K;

    isSelected?: boolean;

    /** Whether the option can show both selected and error indicators */
    canShowSeveralIndicators?: boolean;

    isDisabledCheckbox?: boolean;

    /** Whether this option is disabled for selection */
    isDisabled?: boolean | null;

    /** Whether to hide the selection button (radio/checkbox) entirely, e.g. for structural parent rows that only provide hierarchy context */
    shouldHideSelectionButton?: boolean;

    isInteractive?: boolean;

    /** List title is bold by default. Use this props to customize it */
    isBold?: boolean;

    accountID?: number | null;
    login?: string | null;

    /** Content rendered before the text column (e.g. an avatar or icon) */
    leftElement?: ReactNode;

    /** Content rendered beside the text (e.g. a badge or inline icon) */
    rightElement?: ReactNode;

    /** Standalone control (e.g. a button) rendered after the selection button at the row's end */
    actionElement?: ReactNode;

    /** Icons for the user (can be multiple if it's a Workspace) */
    icons?: Icon[];

    errors?: Errors;

    /** The type of action that's pending  */
    pendingAction?: PendingAction;

    invitedSecondaryLogin?: string;

    reportID?: string;
    policyID?: string;

    searchText?: string | null;

    brickRoadIndicator?: BrickRoad | '' | null;

    /** Element to render below the ListItem */
    footerContent?: ReactNode;

    /** Whether item pressable wrapper should be focusable */
    tabIndex?: 0 | -1;

    /** Determines whether the newly added item should animate in / highlight */
    shouldAnimateInHighlight?: boolean;

    /** Style merged onto the row content wrapper after the variant's own row styles */
    itemStyle?: StyleProp<ViewStyle>;

    /** Style merged onto the title after the variant's own title styles */
    titleStyles?: StyleProp<TextStyle>;

    /** Boolean whether to display the right icon */
    shouldShowRightCaret?: boolean;

    /** Used to initiate payment from search page */
    hash?: number;

    /** BCP 47 language tag for screen reader pronunciation (maps to HTML lang attribute on web) */
    lang?: string;
};

type ListItemFocusEventHandler = (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void;

type ExtendedTargetedEvent = TargetedEvent & {
    /** Provides information about the input device responsible for the event, or null if triggered programmatically, available in some browsers */
    sourceCapabilities?: {
        /** A boolean value that indicates whether the device dispatches touch events. */
        firesTouchEvents: boolean;
    };
};

/** Props every SelectionList row receives from the list (via ListItemRenderer) or from a direct render outside a list. */
type ListItemProps<TItem extends ListItem> = {
    /** The list item data */
    item: TItem;

    /** Whether this item is focused (for arrow key controls) */
    isFocused?: boolean;

    /**
     * Whether the focus indicator should be visually shown.
     * Pass explicitly to decouple the visual highlight from logical focus,
     * e.g. to suppress the initial highlight until the user starts keyboard navigation.
     */
    isFocusVisible?: boolean;

    isDisabled?: boolean | null;
    showTooltip: boolean;

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple?: boolean;

    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onSelectionButtonPress?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;
    onDismissError?: (item: TItem) => void;
    onFocus?: ListItemFocusEventHandler;

    /**
     * Whether the focus on the element should be synchronized. For example it should be set to false when the text input above list items is currently focused.
     * When we type something into the text input, the first element found is focused, in this situation we should not synchronize the focus on the element because we will lose the focus from the text input.
     */
    shouldSyncFocus?: boolean;

    /** Prevent the submission of the list item when enter key is pressed */
    shouldPreventEnterKeySubmit?: boolean;

    /** Which side of the row to render the selection button on */
    selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;

    /** Style of the row content wrapper, merged after the variant's own row styles and before `item.itemStyle` */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Maximum number of title lines. Values above 1 also enable wrapping and leading-indent handling. Defaults to 1 */
    titleNumberOfLines?: number;

    /** Maximum number of alternate text lines. Values above 1 enable wrapping. Defaults to 1 */
    alternateTextNumberOfLines?: number;

    shouldDisableHoverStyle?: boolean;

    /** Whether this is the last item in the list (for border radius on desktop) */
    isLastItem?: boolean;

    /** Whether this is the first item in the list (for border styling on desktop) */
    isFirstItem?: boolean;
};

/** Any component that renders one SelectionList row for items of type TItem */
type ListItemComponent<TItem extends ListItem> = ComponentType<ListItemProps<TItem>>;

/** Props of the ListItem pressable root. Row content comes as children and reads hover/focus/tooltip state from ListItemContext */
type ListItemPressableProps<TItem extends ListItem> = PropsWithChildren<{
    item: TItem;
    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onDismissError?: (item: TItem) => void;
    onLongPressRow?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;
    onFocus?: ListItemFocusEventHandler;
    isDisabled?: boolean | null;
    isFocused?: boolean;

    /** Whether the focus indicator should be visually shown. Defaults to `isFocused` */
    isFocusVisible?: boolean;

    /** Overrides the row's selected state (aria-selected, highlight). Defaults to `item.isSelected`; pass it when selection isn't stored on the item itself. */
    isSelected?: boolean;

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple?: boolean;

    /** Whether content inside the row should show tooltips */
    shouldShowTooltip: boolean;
    shouldPreventEnterKeySubmit?: boolean;
    shouldSyncFocus?: boolean;
    shouldHighlightSelectedItem?: boolean;
    shouldDisableHoverStyle?: boolean;
    pressableStyle?: StyleProp<ViewStyle>;
    pressableWrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Style of the offline-feedback content container that wraps the pressable and its error row */
    containerStyle?: StyleProp<ViewStyle>;
    errorRowStyles?: StyleProp<ViewStyle>;
    hoverStyle?: StyleProp<ViewStyle>;

    /**
     * Whether the pressable should be accessible as a single element.
     * When false, allows child elements (like TextInput) to be independently focusable by screen readers.
     */
    accessible?: boolean;

    /** Overrides the row's screen-reader name. Defaults to the item's derived label when omitted. */
    accessibilityLabel?: string;

    /** Accessibility role for the list item (e.g. 'checkbox' for multi-select options so screen readers announce checked state) */
    accessibilityRole?: Role;

    /** When `false`, a single-select row stays a `button` instead of becoming a listbox `option`. */
    shouldUseOptionRole?: boolean;
}>;

/** Props for SelectableListItem, which extends the composed ListItem pressable with selection button support. */
type SelectableListItemProps<TItem extends ListItem> = PropsWithChildren<{
    item: TItem;
    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** Callback to fire when the selection button is pressed */
    onSelectionButtonPress?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;
    onDismissError?: (item: TItem) => void;
    onFocus?: ListItemFocusEventHandler;
    isDisabled?: boolean | null;
    isFocused?: boolean;
    isFocusVisible?: boolean;
    canSelectMultiple?: boolean;

    /** Whether text in the row should show tooltips on overflow (forwarded to the pressable as shouldShowTooltip) */
    showTooltip: boolean;
    shouldPreventEnterKeySubmit?: boolean;
    shouldSyncFocus?: boolean;

    /** Style of the row View that lays out the selection button, children, and the item's action element */
    wrapperStyle?: StyleProp<ViewStyle>;
    selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;

    /** Accessibility role for the list item (e.g. 'checkbox' for multi-select options so screen readers announce checked state) */
    accessibilityRole?: Role;
}>;

type SingleSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    /** Accessibility role for the list item (e.g. 'checkbox' for multi-select options so screen readers announce checked state) */
    accessibilityRole?: Role;
};

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> &
    ForwardedFSClassProps & {
        pressableStyle?: StyleProp<ViewStyle>;
        shouldHighlightSelectedItem?: boolean;
    };

type SpendRuleListItemType = ListItem & {
    /** The action for this rule */
    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;

    /** The cards that the spend rule applies to */
    summary: string;

    summaryParts: SpendRuleSummaryPart[];

    /** A list of relevant tokens for searching for specific spend rules */
    searchTokens: string[];
};

type SplitListItemType = ListItem &
    SplitExpense & {
        headerText: string;

        /** Merchant or vendor name */
        merchant: string;

        /** Currency code */
        currency: string;

        /** ID of split expense */
        transactionID: string;

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

        /** Called when the row's amount/percentage input gains focus, so the list can scroll it into view */
        onInputFocus?: (item: SplitListItemType) => void;
    };

type WorkspaceListItemType = {
    text: string;
    policyID?: string;
    isPolicyAdmin?: boolean;
    isArchived?: boolean;
    brickRoadIndicator?: BrickRoad;
} & ListItem;

export type {
    SpendRuleListItemType,
    ListItemPressableProps,
    ExtendedTargetedEvent,
    ListItem,
    ListItemComponent,
    ListItemProps,
    ListItemFocusEventHandler,
    SelectableListItemProps,
    SingleSelectListItemProps,
    UserListItemProps,
    SplitListItemType,
    WorkspaceListItemType,
};
