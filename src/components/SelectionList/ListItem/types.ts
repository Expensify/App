import type {HoldMenuCallback} from '@components/Search';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {SpendRuleSummaryPart} from '@libs/SpendRulesUtils';
import type {BrickRoad} from '@libs/WorkspacesSettingsUtils';

// eslint-disable-next-line no-restricted-imports
import type CursorStyles from '@styles/utils/cursor/types';

import type CONST from '@src/CONST';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

import type {PropsWithChildren, ReactNode} from 'react';
import type {BlurEvent, NativeSyntheticEvent, Role, StyleProp, TargetedEvent, TextStyle, ViewStyle} from 'react-native';
import type {AnimatedStyle} from 'react-native-reanimated';
import type {ValueOf} from 'type-fest';

type ListItem<K extends string | number = string> = {
    text?: string;
    alternateText?: string | null;

    /** Custom node rendered in place of the alternate text (e.g. a description containing an inline link). Takes precedence over `alternateText` when set. */
    alternateTextComponent?: ReactNode;

    /** Whether to force hide the alternate text even if it exists */
    shouldHideAlternateText?: boolean;

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
    leftElement?: ReactNode;
    rightElement?: ReactNode;

    /**
     * Standalone control rendered at the very end of the row: after the selection button and outside the row's
     * accessible content group, so screen readers can focus it independently. Use `rightElement` instead for
     * content that belongs beside the text (badges, inline icons).
     */
    actionElement?: ReactNode;

    /** Icons for the user (can be multiple if it's a Workspace) */
    icons?: Icon[];

    errors?: Errors;

    /** The type of action that's pending  */
    pendingAction?: PendingAction;

    invitedSecondaryLogin?: string;

    /** Represents the index of the section it came from  */
    sectionIndex?: number;

    /** Represents the index of the option within the section it came from */
    index?: number;

    reportID?: string;
    policyID?: string;
    groupID?: string;
    categoryID?: string;
    shouldShowSubscript?: boolean | null;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Whether to wrap the alternate text up to 2 lines */
    isAlternateTextMultilineSupported?: boolean;

    searchText?: string | null;

    /** What text to show inside the badge (if none present the badge will be omitted) */
    badgeText?: string;

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

    titleStyles?: StyleProp<TextStyle>;

    /** Boolean whether to display the right icon */
    shouldShowRightCaret?: boolean;

    /** Used to initiate payment from search page */
    hash?: number;

    /** BCP 47 language tag for screen reader pronunciation (maps to HTML lang attribute on web) */
    lang?: string;
};

type CommonListItemProps<TItem extends ListItem> = {
    /** Whether this item is focused (for arrow key controls) */
    isFocused?: boolean;

    isDisabled?: boolean | null;
    showTooltip: boolean;

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple?: boolean;

    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onDismissError?: (item: TItem) => void;
    pressableStyle?: StyleProp<ViewStyle>;
    pressableWrapperStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Style of the offline-feedback content container that wraps the pressable and its error row */
    containerStyle?: StyleProp<ViewStyle>;
    errorRowStyles?: StyleProp<ViewStyle>;

    /** Whether to wrap long text up to 2 lines */
    isMultilineSupported?: boolean;

    /** Whether to wrap the alternate text up to 2 lines */
    isAlternateTextMultilineSupported?: boolean;

    alternateTextNumberOfLines?: number;

    /** Number of lines to show for title text when multiline is supported */
    titleNumberOfLines?: number;

    onFocus?: ListItemFocusEventHandler;

    /**
     * Whether the focus indicator should be visually shown.
     * Pass explicitly to decouple the visual highlight from logical focus,
     * e.g. to suppress the initial highlight until the user starts keyboard navigation.
     */
    isFocusVisible?: boolean;

    onLongPressRow?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

    /** Accessibility role for the list item (e.g. 'checkbox' for multi-select options so screen readers announce checked state) */
    accessibilityRole?: Role;

    /** When `false`, a single-select row stays a `button` instead of becoming a listbox `option`. */
    shouldUseOptionRole?: boolean;

    /** Overrides the row's selected state (aria-selected, highlight). Defaults to `item.isSelected`; pass it when selection isn't stored on the item itself. */
    isSelected?: boolean;
};

type ListItemFocusEventHandler = (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void;

type ExtendedTargetedEvent = TargetedEvent & {
    /** Provides information about the input device responsible for the event, or null if triggered programmatically, available in some browsers */
    sourceCapabilities?: {
        /** A boolean value that indicates whether the device dispatches touch events. */
        firesTouchEvents: boolean;
    };
};

type ListItemProps<TItem extends ListItem> = CommonListItemProps<TItem> & {
    /** The section list item */
    item: TItem;

    onSelectionButtonPress?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

    /** Which side of the row to render the selection button on */
    selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;

    style?: StyleProp<TextStyle>;
    isHovered?: boolean;

    /** Prevent the submission of the list item when enter key is pressed */
    shouldPreventEnterKeySubmit?: boolean;

    /**
     * Whether the focus on the element should be synchronized. For example it should be set to false when the text input above list items is currently focused.
     * When we type something into the text input, the first element found is focused, in this situation we should not synchronize the focus on the element because we will lose the focus from the text input.
     */
    shouldSyncFocus?: boolean;

    titleStyles?: StyleProp<TextStyle>;
    titleContainerStyles?: StyleProp<ViewStyle>;
    shouldHighlightSelectedItem?: boolean;
    index?: number;
    onInputFocus?: (item: TItem) => void;
    onInputBlur?: (e: BlurEvent) => void;
    onHoldMenuOpen?: HoldMenuCallback;
    shouldDisableHoverStyle?: boolean;

    /** Whether the network is offline */
    isOffline?: boolean;

    /** Whether this is the last item in the list (for border radius on desktop) */
    isLastItem?: boolean;

    /** Whether this is the first item in the list (for border styling on desktop) */
    isFirstItem?: boolean;
};

/**
 * Props of the composed ListItem pressable root. Row content is passed as plain children; hover/focus/tooltip state reaches it through ListItemContext.
 * Content-level props (wrapper style, multiline options) are omitted: the pressable never reads them, so the variant that renders them declares them.
 */
type ListItemPressableProps<TItem extends ListItem> = PropsWithChildren<
    Omit<CommonListItemProps<TItem>, 'showTooltip' | 'wrapperStyle' | 'isMultilineSupported' | 'isAlternateTextMultilineSupported' | 'alternateTextNumberOfLines' | 'titleNumberOfLines'> & {
        item: TItem;

        /** Whether content inside the row should show tooltips (provided to children via ListItemContext) */
        shouldShowTooltip: boolean;

        /** Overrides the row's screen-reader name. Defaults to the item's derived label when omitted. */
        accessibilityLabel?: string;
        shouldPreventEnterKeySubmit?: boolean;
        errorRowStyles?: StyleProp<ViewStyle>;
        shouldSyncFocus?: boolean;
        hoverStyle?: StyleProp<ViewStyle>;
        shouldHighlightSelectedItem?: boolean;
        shouldDisableHoverStyle?: boolean;

        /**
         * Whether the pressable should be accessible as a single element.
         * When false, allows child elements (like TextInput) to be independently focusable by screen readers.
         */
        accessible?: boolean;
    }
>;

type SpendRuleListItemType = ListItem & {
    /** The action for this rule */
    action: ValueOf<typeof CONST.SPEND_RULES.ACTION>;

    /** The cards that the spend rule applies to */
    summary: string;

    summaryParts: SpendRuleSummaryPart[];

    /** A list of relevant tokens for searching for specific spend rules */
    searchTokens: string[];
};

/** Props for SelectableListItem, which extends the composed ListItem pressable with selection button support. */
type SelectableListItemProps<TItem extends ListItem> = Omit<ListItemPressableProps<TItem>, 'containerStyle' | 'shouldShowTooltip'> &
    ForwardedFSClassProps & {
        /** Whether text in the row should show tooltips on overflow (forwarded to the pressable as shouldShowTooltip) */
        showTooltip: boolean;

        /** Style of the row View that lays out the selection button, children, and the item's action element */
        wrapperStyle?: StyleProp<ViewStyle>;

        /** Callback to fire when the selection button is pressed */
        onSelectionButtonPress?: (item: TItem, itemTransactions?: TransactionListItemType[]) => void;

        selectionButtonPosition?: ValueOf<typeof CONST.SELECTION_BUTTON_POSITION>;
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

        onInputFocus?: (item: SplitListItemType) => void;
    };

type SingleSelectListItemProps<TItem extends ListItem> = ListItemProps<TItem>;

type UserListItemProps<TItem extends ListItem> = ListItemProps<TItem> & ForwardedFSClassProps;

type InviteMemberListItemProps<TItem extends ListItem> = UserListItemProps<TItem>;

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
    ListItemProps,
    ListItemFocusEventHandler,
    SelectableListItemProps,
    SingleSelectListItemProps,
    UserListItemProps,
    InviteMemberListItemProps,
    SplitListItemType,
    WorkspaceListItemType,
};
