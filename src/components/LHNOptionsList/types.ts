import type {ContentStyle} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import type {Locale, PersonalDetailsList, Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type CustomLHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: StyleProp<ContentStyle>;

    /** Sections for the section list */
    data: string[];

    /** Callback to fire when a row is selected */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View>) => void;

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
    isFocused?: boolean;

    /** List of users' personal details */
    personalDetails?: PersonalDetailsList;

    /** The preferred language for the app */
    preferredLocale?: OnyxEntry<Locale>;

    /** The full data of the report */
    fullReport: OnyxEntry<Report>;

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
    optionItem?: OptionData;

    /** Whether a report contains a draft */
    hasDraftComment: boolean;

    onLayout?: (event: LayoutChangeEvent) => void;
};

type RenderItemProps = {item: string};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, RenderItemProps};
