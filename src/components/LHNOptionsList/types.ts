import type {RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import type {Locale, OnboardingPurpose, PersonalDetailsList, Policy, Report, ReportAction, ReportActions, ReportNameValuePairs, Transaction, TransactionViolation} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';

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

    /** The preferred language for the app */
    preferredLocale?: OnyxEntry<Locale>;

    /** The active policy ID */
    activePolicyID?: string;

    /** The onboarding purpose */
    onboardingPurpose?: OnboardingPurpose;

    /** Whether the fullscreen is visible */
    isFullscreenVisible?: boolean;

    /** Whether the reports split navigator is last */
    isReportsSplitNavigatorLast: boolean;

    /** The full data of the report */
    fullReport: OnyxEntry<Report>;

    /** The transaction thread report associated with the current report, if any */
    oneTransactionThreadReport: OnyxEntry<Report>;

    /** Array of report name value pairs for this report */
    reportNameValuePairs: OnyxEntry<ReportNameValuePairs>;

    /** The policy which the user has access to and which the report could be tied to */
    policy?: OnyxEntry<Policy>;

    /** Invoice receiver policy */
    invoiceReceiverPolicy?: OnyxEntry<Policy>;

    /** The action from the parent report */
    parentReportAction?: OnyxEntry<ReportAction>;

    /** The transaction from the parent report action */
    transaction: OnyxEntry<Transaction>;

    /** The transaction linked to the report's last action */
    lastReportActionTransaction?: OnyxEntry<Transaction>;

    /** Whether a report contains a draft */
    hasDraftComment: boolean;

    /** The receipt transaction from the parent report action */
    receiptTransactions: OnyxCollection<Transaction>;

    /** The reportID of the report */
    reportID: string;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /**
     * Array of report actions for the IOU report related to the last action of this report.
     * If the last action is a report action preview, the last message of the report depends on
     * the report actions of the IOU report linked to the report action preview.
     * Changes in the IOU report report actions will affect the last message of this report.
     */
    iouReportReportActions: OnyxEntry<ReportActions>;

    /** List of transaction violation */
    transactionViolations: OnyxCollection<TransactionViolation[]>;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** The last message text from the report */
    lastMessageTextFromReport: string;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View | null>) => void;

    /** Callback to execute when the OptionList lays out */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** The report attributes for the report */
    reportAttributes: OnyxEntry<ReportAttributes>;

    /** Whether to show the educational tooltip for the GBR or RBR */
    shouldShowRBRorGBRTooltip: boolean;

    /** Whether the screen is focused */
    isScreenFocused?: boolean;

    /** Function to compare locale strings */
    localeCompare: LocaleContextProps['localeCompare'];

    /** Function to translate locale strings */
    translate: LocalizedTranslate;

    /** TestID of the row, indicating order */
    testID: number;

    /** Whether the report is archived */
    isReportArchived: boolean;

    /** The last action should be displayed */
    lastAction: ReportAction | undefined;

    lastActionReport: OnyxEntry<Report> | undefined;
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

    /** The onboarding purpose */
    onboardingPurpose?: OnboardingPurpose;

    /** Whether the fullscreen is visible */
    isFullscreenVisible?: boolean;

    /** Whether the reports split navigator is last */
    isReportsSplitNavigatorLast: boolean;

    /** Whether a report contains a draft */
    hasDraftComment: boolean;

    onLayout?: (event: LayoutChangeEvent) => void;

    /** Whether to show the educational tooltip on the GBR or RBR */
    shouldShowRBRorGBRTooltip: boolean;

    /** Whether the screen is focused */
    isScreenFocused?: boolean;

    /** The testID of the row */
    testID: number;
};

type RenderItemProps = {item: Report; index: number};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, RenderItemProps};
