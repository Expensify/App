import type {PersonalDetailsList, Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

// string type union is here for percentage values
type TransactionPreviewStyleType = {
    width: number | string;
    maxWidth?: number | string;
};

type TransactionPreviewProps = {
    /** The active reportID linked to the transaction */
    iouReportID: string | undefined;

    chatReport: OnyxEntry<Report>;
    reportID: string | undefined;
    onPreviewPressed?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxEntry<ReportAction>;

    containerStyles?: StyleProp<ViewStyle>;

    /** Width to use for skeleton loader of transaction preview */
    transactionPreviewWidth: TransactionPreviewStyleType['width'];

    /** True if this IOU has a type of split */
    isBillSplit: boolean;

    /** Whether this IOU is a track expense */
    isTrackExpense: boolean;

    /** True if the IOU Preview card is hovered */
    isHovered?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** In the case where we have access to the transactionID in the parent */
    transactionID?: string;

    reportPreviewAction?: ReportAction;

    /** Whether to show payer/receiver data in the preview */
    shouldShowPayerAndReceiver?: boolean;

    /** In case we want to override context menu action */
    contextAction?: OnyxEntry<ReportAction>;

    shouldHighlight?: boolean;
};

type TransactionPreviewContentProps = {
    /** Handles the UI response and data clean-up when the transaction goes offline. */
    offlineWithFeedbackOnClose: () => void;

    /** Navigates the user to a separate view or component for reviewing or editing transaction fields. */
    navigateToReviewFields: () => void;

    isWhisper?: boolean;

    /** Determines if the element is currently hovered over. */
    isHovered?: boolean;

    containerStyles?: StyleProp<ViewStyle>;

    /** Width to use for skeleton loader of transaction preview */
    transactionPreviewWidth: TransactionPreviewStyleType['width'];

    walletTermsErrors: Errors | undefined;

    /** Represents the report linked to the transaction */
    report: OnyxEntry<Report>;

    /** The policy the report linked to the transaction belongs to */
    policy: OnyxEntry<Policy>;

    /** Flag to determine if a transaction involves a bill split among multiple parties. */
    isBillSplit: boolean;

    transaction: OnyxEntry<Transaction>;

    /** The amount of the transaction saved in the database. This is used to deduce who is the sender and who is the receiver of the money request
     * In case of Splits the property `transaction` is actually an original transaction (for the whole split) and it does not have the data required to deduce who is the sender */
    transactionRawAmount: number;

    action: OnyxEntry<ReportAction>;

    /** Contains data about potential transaction violations */
    violations: TransactionViolations;

    chatReport: OnyxEntry<Report>;

    /** Optional details about people involved in the transaction */
    personalDetails?: PersonalDetailsList;

    /** Indicates whether the transaction consists of duplicates */
    areThereDuplicates: boolean;

    sessionAccountID?: number;

    /** Name of the route where the transaction preview is being displayed */
    routeName: string;

    /** Determine whether to hide the component's children if deletion is pending */
    shouldHideOnDelete?: boolean;

    reportPreviewAction?: ReportAction;

    /** Whether to show payer/receiver data in the preview */
    shouldShowPayerAndReceiver?: boolean;

    /** Is this component used during duplicate review flow */
    isReviewDuplicateTransactionPage?: boolean;

    shouldHighlight?: boolean;
};

export type {TransactionPreviewContentProps, TransactionPreviewProps, TransactionPreviewStyleType};
