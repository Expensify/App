import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type {PersonalDetailsList, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type TransactionPreviewStyleType = {
    width: number;
    maxWidth?: number;
};

type TransactionPreviewProps = {
    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string | undefined;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The ID of the current report */
    reportID: string | undefined;

    /** Callback for the preview pressed */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxEntry<ReportAction>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Optional custom styles to be applied to container component. */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional custom styles to be applied to wrapper component. */
    wrapperStyles: TransactionPreviewStyleType;

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
};

type TransactionPreviewContentProps = {
    /** Function to display the context menu in response to an event. */
    showContextMenu: (event: GestureResponderEvent) => void;

    /** Handles the UI response and data clean-up when the transaction goes offline. */
    offlineWithFeedbackOnClose: () => void;

    /** Navigates the user to a separate view or component for reviewing or editing transaction fields. */
    navigateToReviewFields: () => void;

    /** General callback for handling presses on the preview component, can also handle keyboard events. */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent | undefined) => void;

    /** Whether the transaction is whisper. */
    isWhisper?: boolean;

    /** Determines if the element is currently hovered over. */
    isHovered?: boolean;

    /** Optional custom styles to be applied to container component. */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional custom styles to be applied to wrapper component. */
    wrapperStyles: TransactionPreviewStyleType;

    /** Records any errors related to wallet terms. */
    walletTermsErrors: Errors | undefined;

    /** Represents the IOU report entry from Onyx */
    iouReport: OnyxEntry<Report>;

    /** Flag to determine if a transaction involves a bill split among multiple parties. */
    isBillSplit: boolean;

    /** Holds the transaction data entry from Onyx */
    transaction: OnyxEntry<Transaction>;

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
};

export type {TransactionPreviewProps, TransactionPreviewContentProps, TransactionPreviewStyleType};
