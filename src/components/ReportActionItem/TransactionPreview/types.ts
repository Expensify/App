import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {PersonalDetailsList, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

// string type union is here for percentage values
type TransactionPreviewStyleType = {
    width: number | string;
    maxWidth?: number | string;
};

type TransactionPreviewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<Report>;

    /** The active reportID linked to the transaction */
    iouReportID: string | undefined;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The ID of the current report */
    reportID: string | undefined;

    /** Callback called when the preview is pressed  */
    onPreviewPressed?: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxEntry<ReportAction>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Optional custom styles to be applied to container component. */
    containerStyles?: StyleProp<ViewStyle>;

    /** Width to use for skeleton loader of transaction preview */
    transactionPreviewWidth: TransactionPreviewStyleType['width'];

    /** True if this IOU has a type of split */
    isBillSplit: boolean;

    /** Whether this IOU is a track expense */
    isTrackExpense: boolean;

    /** True if the IOU Preview card is hovered */
    isHovered?: boolean;

    /** Whether or not an IOU report contains expenses in a different currency
     * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
     */
    shouldShowPendingConversionMessage?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether  context menu should be shown on press */
    shouldDisplayContextMenu?: boolean;

    /** In the case where we have access to the transactionID in the parent */
    transactionID?: string;

    /** The action to be displayed in the preview */
    reportPreviewAction?: ReportAction;

    /** Whether to show payer/receiver data in the preview */
    shouldShowPayerAndReceiver?: boolean;

    /** In case we want to override context menu action */
    contextAction?: OnyxEntry<ReportAction>;

    /** Whether the item should be highlighted */
    shouldHighlight?: boolean;
};

type TransactionPreviewContentProps = {
    /** Handles the UI response and data clean-up when the transaction goes offline. */
    offlineWithFeedbackOnClose: () => void;

    /** Navigates the user to a separate view or component for reviewing or editing transaction fields. */
    navigateToReviewFields: () => void;

    /** Whether the transaction is whisper. */
    isWhisper?: boolean;

    /** Determines if the element is currently hovered over. */
    isHovered?: boolean;

    /** Optional custom styles to be applied to container component. */
    containerStyles?: StyleProp<ViewStyle>;

    /** Width to use for skeleton loader of transaction preview */
    transactionPreviewWidth: TransactionPreviewStyleType['width'];

    /** Records any errors related to wallet terms. */
    walletTermsErrors: Errors | undefined;

    /** Represents the report linked to the transaction */
    report: OnyxEntry<Report>;

    /** Flag to determine if a transaction involves a bill split among multiple parties. */
    isBillSplit: boolean;

    /** Holds the transaction data entry from Onyx */
    transaction: OnyxEntry<Transaction>;

    /** The amount of the transaction saved in the database. This is used to deduce who is the sender and who is the receiver of the money request
     * In case of Splits the property `transaction` is actually an original transaction (for the whole split) and it does not have the data required to deduce who is the sender */
    transactionRawAmount: number;

    /** Represents the action entry from Onyx */
    action: OnyxEntry<ReportAction>;

    /** Contains data about potential transaction violations */
    violations: TransactionViolations;

    /** Holds the chat report entry from Onyx */
    chatReport?: Report;

    /** Optional details about people involved in the transaction */
    personalDetails?: PersonalDetailsList;

    /** Indicates whether the transaction consists of duplicates */
    areThereDuplicates: boolean;

    /** Session account ID */
    sessionAccountID?: number;

    /** Name of the route where the transaction preview is being displayed */
    routeName: string;

    /** Determine whether to hide the component's children if deletion is pending */
    shouldHideOnDelete?: boolean;

    /** The action to be displayed in the preview */
    reportPreviewAction?: ReportAction;

    /** Whether to show payer/receiver data in the preview */
    shouldShowPayerAndReceiver?: boolean;

    /** Is this component used during duplicate review flow */
    isReviewDuplicateTransactionPage?: boolean;

    /** Whether the item should be highlighted */
    shouldHighlight?: boolean;
};

export type {TransactionPreviewContentProps, TransactionPreviewProps, TransactionPreviewStyleType};
