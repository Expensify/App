import type {ContentStyle} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type OptionListItem = {
    /** The reportID of the report */
    reportID: string;

    /** The item that should be rendered */
    optionItem: OptionData | undefined;

    /** Comment added to report */
    comment: string;
};

type CustomLHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: StyleProp<ContentStyle>;

    /** Sections for the section list */
    data: OptionListItem[];

    /** Callback to fire when a row is selected */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View>) => void;

    /** Toggle between compact and default view of the option */
    optionMode: OptionMode;

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions?: boolean;

    /** Callback to fire when the list is laid out */
    onFirstItemRendered: () => void;
};

type LHNOptionsListProps = CustomLHNOptionsListProps & CurrentReportIDContextValue;

type OptionRowLHNDataProps = {
    /** Whether row should be focused */
    isFocused?: boolean;

    /** Comment added to report */
    comment: string;

    /** The item that should be rendered */
    optionItem: OptionData | undefined;

    /** The reportID of the report */
    reportID: string;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View>) => void;

    /** Callback to execute when the OptionList lays out */
    onLayout?: (event: LayoutChangeEvent) => void;
};

type OptionRowLHNProps = {
    /** The ID of the report that the option is for */
    reportID: string;

    /** Whether this option is currently in focus so we can modify its style */
    isFocused?: boolean;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View>) => void;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** Additional style props */
    style?: StyleProp<TextStyle>;

    /** The item that should be rendered */
    optionItem: OptionData | undefined;

    onLayout?: (event: LayoutChangeEvent) => void;
};

type RenderItemProps = {item: OptionListItem};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, OptionListItem, RenderItemProps};
