import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';

import type {ComponentRef, RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, View, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type CustomLHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: StyleProp<ViewStyle>;

    /** The ordered IDs of the reports to render */
    data: string[];
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<ComponentRef<typeof View> | null>) => void;

    /** Toggle between compact and default view of the option */
    optionMode: OptionMode;

    shouldDisableFocusOptions?: boolean;

    /** Callback to fire when the list is laid out */
    onFirstItemRendered: () => void;

    /** Header rendered as the list's first item */
    listHeaderComponent?: React.ReactNode;
};

type LHNOptionsListProps = CustomLHNOptionsListProps;

type OptionRowLHNDataProps = {
    /** Whether row should be focused */
    isOptionFocused?: boolean;

    reportID: string;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<ComponentRef<typeof View> | null>) => void;

    /** Callback to execute when the OptionList lays out */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** TestID of the row, indicating order */
    testID: number;
};

type OptionRowLHNProps = {
    isOptionFocused?: boolean;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<ComponentRef<typeof View> | null>) => void;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    optionItem: OptionData;

    /** Whether a report contains a draft */
    hasDraftComment: boolean;

    onLayout?: (event: LayoutChangeEvent) => void;

    /** The testID of the row */
    testID: number;
    /** Whether to show "Mark as done" copy instead of "Submit" copy for track-intent users */
    shouldShowMarkAsDoneCopy?: boolean;
};

type RenderItemProps = {item: string; index: number};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, RenderItemProps};
