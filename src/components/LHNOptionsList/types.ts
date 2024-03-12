import type {ContentStyle} from '@shopify/flash-list';
import type {RefObject} from 'react';
import type {LayoutChangeEvent, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import type CONST from '@src/CONST';
import type {OptionData} from '@src/libs/ReportUtils';
import type {Locale, PersonalDetailsList, Policy, Report, ReportAction, ReportActions, Transaction, TransactionViolation} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {EmptyObject} from '@src/types/utils/EmptyObject';

type OptionMode = ValueOf<typeof CONST.OPTION_MODE>;

type LHNOptionsListOnyxProps = {
    /** The policy which the user has access to and which the report could be tied to */
    policy: OnyxCollection<Policy>;

    /** All reports shared with the user */
    reports: OnyxCollection<Report>;

    /** Array of report actions for this report */
    reportActions: OnyxCollection<ReportActions>;

    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<Locale>;

    /** List of users' personal details */
    personalDetails: OnyxEntry<PersonalDetailsList>;

    /** The transaction from the parent report action */
    transactions: OnyxCollection<Transaction>;

    /** List of draft comments */
    draftComments: OnyxCollection<string>;

    /** The list of transaction violations */
    transactionViolations: OnyxCollection<TransactionViolation[]>;
};

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

    /** Report IDs with errors mapping to their corresponding error objects */
    reportIDsWithErrors: Record<string, OnyxCommon.Errors>;
};

type LHNOptionsListProps = CustomLHNOptionsListProps & CurrentReportIDContextValue & LHNOptionsListOnyxProps;

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

    /** The action from the parent report */
    parentReportAction?: OnyxEntry<ReportAction>;

    /** The transaction from the parent report action */
    transaction: OnyxEntry<Transaction>;

    /** The transaction linked to the report's last action */
    lastReportActionTransaction?: OnyxEntry<Transaction | EmptyObject>;

    /** Comment added to report */
    comment: string;

    /** The receipt transaction from the parent report action */
    receiptTransactions: OnyxCollection<Transaction>;

    /** The reportID of the report */
    reportID: string;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /** List of transaction violation */
    transactionViolations: OnyxCollection<TransactionViolation[]>;

    /** Whether the user can use violations */
    canUseViolations: boolean | undefined;

    /** Toggle between compact and default view */
    viewMode?: OptionMode;

    /** A function that is called when an option is selected. Selected option is passed as a param */
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<View>) => void;

    /** Callback to execute when the OptionList lays out */
    onLayout?: (event: LayoutChangeEvent) => void;

    /** The report errors */
    reportErrors: OnyxCommon.Errors | undefined;
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

    onLayout?: (event: LayoutChangeEvent) => void;
};

type RenderItemProps = {item: string};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps, LHNOptionsListOnyxProps, RenderItemProps};
