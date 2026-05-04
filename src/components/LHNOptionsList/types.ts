import type {RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import type {PersonalDetailsList, Policy, Report} from '@src/types/onyx';
import type {ReportAttributes, ReportAttributesDerivedValue} from '@src/types/onyx/DerivedValues';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type CustomLHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: StyleProp<ViewStyle>;

    /** List of reports */
    data: Report[];

    /** Callback to fire when a row is selected */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View | null>) => void;

    /** Toggle between compact and default view of the option */
    optionMode: OptionMode;

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions?: boolean;

    /** Callback to fire when the list is laid out */
    onFirstItemRendered: () => void;
};

type LHNOptionsListProps = CustomLHNOptionsListProps;

type OptionRowLHNDataProps = {
    /** Whether row should be focused */
    isOptionFocused?: boolean;

    /** List of users' personal details */
    personalDetails?: PersonalDetailsList;

    /** The full data of the report */
    fullReport: OnyxEntry<Report>;

    /** The transaction thread report associated with the current report, if any */
    oneTransactionThreadReport: OnyxEntry<Report>;

    /** The policy which the user has access to and which the report could be tied to */
    policy?: OnyxEntry<Policy>;

    /** Invoice receiver policy */
    invoiceReceiverPolicy?: OnyxEntry<Policy>;

    /** The reportID of the report */
    reportID: string;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View | null>) => void;

    /** Callback to execute when the OptionList lays out */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** The report attributes for the report */
    reportAttributes: OnyxEntry<ReportAttributes>;

    /** The derived report attributes for all reports */
    reportAttributesDerived?: ReportAttributesDerivedValue['reports'];

    /** The concierge report ID, hoisted from list level to avoid per-item subscription */
    conciergeReportID: OnyxEntry<string>;

    /** TestID of the row, indicating order */
    testID: number;
};

type OptionRowLHNProps = {
    /** The ID of the report that the option is for */
    reportID: string;

    /** The report for this option */
    report?: Report;

    /** Whether this option is currently in focus so we can modify its style */
    isOptionFocused?: boolean;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View | null>) => void;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** Additional style props */
    style?: StyleProp<TextStyle>;

    /** The item that should be rendered */
    optionItem?: OptionData;

    /** Whether a report contains a draft */
    hasDraftComment: boolean;

    onLayout?: (event: LayoutChangeEvent) => void;

    /** The testID of the row */
    testID: number;

    /** The concierge report ID from Onyx */
    conciergeReportID: OnyxEntry<string>;
};

type RenderItemProps = {item: Report; index: number};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, RenderItemProps};
