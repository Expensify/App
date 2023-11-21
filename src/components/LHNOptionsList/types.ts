import {ContentStyle} from '@shopify/flash-list';
import {Transaction} from 'electron';
import {RefObject} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import {ValueOf} from 'type-fest';
import {CurrentReportIDContextValue} from '@components/withCurrentReportID';
import {OptionData} from '@libs/SidebarUtils';
import CONST from '@src/CONST';
import {Beta, PersonalDetails, Policy, Report, ReportAction, ReportActions} from '@src/types/onyx';

type CustomLHNOptionsListProps = {
    /** Wrapper style for the section list */
    style?: StyleProp<ViewStyle>;

    /** Extra styles for the section list container */
    contentContainerStyles?: ContentStyle;

    /** Sections for the section list */
    data: string[];

    /** Callback to fire when a row is selected */
    onSelectRow: (reportID: string) => void;

    /** Toggle between compact and default view of the option */
    optionMode: ValueOf<typeof CONST.OPTION_MODE>;

    /** Whether to allow option focus or not */
    shouldDisableFocusOptions?: boolean;

    /** The policy which the user has access to and which the report could be tied to */
    policy: OnyxEntry<Record<string, Policy>>;

    /** All reports shared with the user */
    reports: OnyxEntry<Record<string, Report>>;

    /** Array of report actions for this report */
    reportActions: OnyxEntry<Record<string, ReportActions>>;

    /** Indicates which locale the user currently has selected */
    preferredLocale: OnyxEntry<ValueOf<typeof CONST.LOCALES>>;

    /** List of users' personal details */
    personalDetails: OnyxEntry<Record<string, PersonalDetails>>;

    /** The transaction from the parent report action */
    transactions: OnyxEntry<Record<string, Transaction>>;

    /** List of draft comments */
    draftComments: OnyxEntry<Record<string, string>>;
};

type LHNOptionsListProps = CustomLHNOptionsListProps & CurrentReportIDContextValue;

type OptionRowLHNDataProps = {
    /** Whether row should be focused */
    isFocused: boolean;

    /** List of users' personal details */
    personalDetails: Record<string, PersonalDetails>;

    /** The preferred language for the app */
    preferredLocale: string;

    /** The full data of the report */
    fullReport: Report;

    /** The policy which the user has access to and which the report could be tied to */
    policy: Policy;

    /** The action from the parent report */
    parentReportAction: ReportAction;

    /** The transaction from the parent report action */
    transaction: Transaction;

    comment: string;

    receiptTransactions: Transaction[];

    reportID: string;
} & CustomLHNOptionsListProps;

type OptionRowLHNProps = {
    hoverStyle?: StyleProp<ViewStyle>;
    betas?: Beta[];
    reportID: string;
    isFocused?: boolean;
    onSelectRow?: (optionItem: OptionData, popoverAnchor: RefObject<Element>) => void;
    viewMode?: ValueOf<typeof CONST.OPTION_MODE>;
    style?: StyleProp<ViewStyle>;
    optionItem?: OptionData;
};

export type {LHNOptionsListProps, OptionRowLHNDataProps, OptionRowLHNProps};
