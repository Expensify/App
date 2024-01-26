import type {Ref} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type CONST from '@src/CONST';
import type {PersonalDetailsList, Report, Session, Transaction, TransactionViolation, WalletTerms} from '@src/types/onyx';
import type {OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import type {ReportActionBase} from '@src/types/onyx/ReportAction';

// typescript version of reportActionFragmentPropType
type MoneyRequestFragment = {
    /** The type of the action item fragment. Used to render a corresponding component */
    type: string;

    /** The text content of the fragment. */
    text: string;

    /** Used to apply additional styling. Style refers to a predetermined constant and not a class name. e.g. 'normal' or 'strong' */
    style?: string;

    /** ID of a report */
    reportID?: string;

    /** ID of a policy */
    policyID?: string;

    /** The target of a link fragment e.g. '_blank' */
    target?: string;

    /** The destination of a link fragment e.g. 'https://www.expensify.com' */
    href?: string;

    /** An additional avatar url - not the main avatar url but used within a message. */
    iconUrl?: string;

    /** Fragment edited flag */
    isEdited?: boolean;
};

// We need to override some of these to match the more general reportActionPropType
type MoneyRequestAction = Omit<ReportActionBase & OriginalMessageIOU, 'person'> & {
    person: MoneyRequestFragment[];
    reportActionID: string;
    created: string;
    actionName: (typeof CONST.REPORT.ACTIONS.TYPE)[keyof typeof CONST.REPORT.ACTIONS.TYPE];
    originalMessage: OriginalMessageIOU;
};

type MoneyRequestPreviewOnyxProps = {
    chatReport: OnyxEntry<Report>;
    iouReport: OnyxEntry<Report>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    session: OnyxEntry<Session>;
    transaction: OnyxEntry<Transaction>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    walletTerms: OnyxEntry<WalletTerms>;
};
type MoneyRequestPreviewProps = {
    action: MoneyRequestAction;
    chatReportID: string;
    checkIfContextMenuActive: () => void;
    containerStyles: StyleProp<ViewStyle>;
    contextMenuAnchor?: Ref<typeof RNText>;
    iouReportID: string;
    isBillSplit: boolean;
    isHovered: boolean;
    isWhisper: boolean;
    onPreviewPressed: (() => void) | null;
    shouldShowPendingConversionMessage: boolean;
} & MoneyRequestPreviewOnyxProps;

export type {MoneyRequestPreviewProps, MoneyRequestPreviewOnyxProps};
