import type {RefObject} from 'react';
import type {SectionList, SectionListData, StyleProp, View, ViewStyle} from 'react-native';
import type {OptionData} from '@libs/ReportUtils';

type OptionsListData = SectionListData<OptionData, Section>;
type OptionsListDataWithIndexOffset = SectionListData<OptionData, SectionWithIndexOffset>;
type OptionsList = SectionList<OptionData, SectionWithIndexOffset>;

type Section = {
    /** Title of the section */
    title: string;

    /** Array of options */
    data: OptionData[];

    /** Whether this section should show or not */
    shouldShow?: boolean;

    /** Whether this section is disabled or not */
    isDisabled?: boolean;

    /** Whether to show an action button in the section header */
    shouldShowActionButton?: boolean;

    /** Title of the action button */
    actionButtonTitle?: string;

    /** Callback of the action button */
    onActionButtonPress?: () => void;
};

type SectionWithIndexOffset = Section & {
    /** The initial index of this section given the total number of options in each section's data array */
    indexOffset?: number;
};

type OptionsListProps = {
    /** option flexStyle for the options list container */
    listContainerStyles?: StyleProp<ViewStyle>;

    /** Style for hovered state */
    optionHoveredStyle?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: StyleProp<ViewStyle>;

    /** Style for section headers */
    sectionHeaderStyle?: StyleProp<ViewStyle>;

    /** Sections for the section list */
    sections: OptionsListData[];

    /** Index for option to focus on */
    focusedIndex?: number;

    /** Array of already selected options */
    selectedOptions?: OptionData[];

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions?: boolean;

    /** Whether we highlight selected options */
    highlightSelectedOptions?: boolean;

    /** Whether to show headers above each section or not */
    hideSectionHeaders?: boolean;

    /** Whether to allow option focus or not */
    disableFocusOptions?: boolean;

    /** Display the text of the option in bold font style */
    boldStyle?: boolean;

    /** Callback to fire when a row is selected */
    onSelectRow?: (option: OptionData, refElement: View | HTMLDivElement | null) => void | Promise<void>;

    /** Optional header message */
    headerMessage?: string;

    /** Passed via forwardRef so we can access the SectionList ref */
    innerRef?: RefObject<SectionList> | ((instance: SectionList | null) => void);

    /** Whether to show the title tooltip */
    showTitleTooltip?: boolean;

    /** Whether to disable the interactivity of the list's option row(s) */
    isDisabled?: boolean;

    /** Whether the options list skeleton loading view should be displayed */
    isLoading?: boolean;

    /** Callback to execute when the SectionList lays out */
    onLayout?: () => void;

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator?: boolean;

    /** Whether to disable the inner padding in rows */
    shouldDisableRowInnerPadding?: boolean;

    /** Whether to prevent default focusing when selecting a row */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to show the scroll bar */
    showScrollIndicator?: boolean;

    /** Whether to wrap large text up to 2 lines */
    isRowMultilineSupported?: boolean;

    /** Whether we are loading new options */
    isLoadingNewOptions?: boolean;

    /** Whether nested scroll of options is enabled, true by default */
    nestedScrollEnabled?: boolean;

    /** Whether the list should have a bounce effect on iOS */
    bounces?: boolean;

    /** Custom content to display in the floating footer */
    renderFooterContent?: JSX.Element;

    /** Whether to show a button pill instead of a standard tickbox */
    shouldShowMultipleOptionSelectorAsButton?: boolean;

    /** Text for button pill */
    multipleOptionSelectorButtonText?: string;

    /** Callback to fire when the multiple selector (tickbox or button) is clicked */
    onAddToSelection?: () => void;

    /** Safe area style */
    safeAreaPaddingBottomStyle?: StyleProp<ViewStyle>;
};

type BaseOptionListProps = OptionsListProps & {
    /** Determines whether the keyboard gets dismissed in response to a drag */
    keyboardDismissMode?: 'none' | 'interactive' | 'on-drag';

    /** Called when the user begins to drag the scroll view. Only used for the native component */
    onScrollBeginDrag?: () => void;

    /** Callback executed on scroll. Only used for web/desktop component */
    onScroll?: () => void;

    /** List styles for SectionList */
    listStyles?: StyleProp<ViewStyle>;
};

export type {OptionsListProps, BaseOptionListProps, Section, OptionsList, OptionsListData, SectionWithIndexOffset, OptionsListDataWithIndexOffset};
