import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ThumbnailAndImageURI} from '@libs/ReceiptUtils';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';

type TransactionPreviewProps = {
    /** The active IOUReport, used for Onyx subscription */
    // The iouReportID is used inside withOnyx HOC
    // eslint-disable-next-line react/no-unused-prop-types
    iouReportID: string | undefined;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The ID of the current report */
    reportID: string | undefined;

    /** Callback for the preview pressed */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent) => void;

    /** All the data of the action, used for showing context menu */
    action: OnyxTypes.ReportAction;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

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
};

type UIProps = {
    /** Indicates whether a skeleton loading screen should be displayed. */
    shouldShowSkeleton: boolean;

    /** Determines whether the RBR should be visible. */
    shouldShowRBR: boolean;

    /** Controls whether the onPress event should be disabled. */
    shouldDisableOnPress: boolean;

    /** Specifies if a 'Keep this one' button should be visible. */
    shouldShowKeepButton: boolean;

    /** Flag indicating whether the description of the transaction should be displayed. */
    shouldShowDescription: boolean;

    /** Determines if the merchant's name or identifier should be visible in the transaction UI. */
    shouldShowMerchant: boolean;

    /** Specifies whether the category of the transaction should be visible to the user. */
    shouldShowCategory: boolean;

    /** Indicates whether tags associated with the transaction should be displayed. */
    shouldShowTag: boolean;
};

type TransactionStatus = {
    /** Marks the transaction as deleted. */
    isDeleted: boolean;

    /** Indicates approval status. */
    isApproved: boolean;

    /** Flag to determine if a transaction involves a bill split among multiple parties. */
    isBillSplit: boolean;

    /** Reflects whether the transaction has been settled. */
    isSettled: boolean;

    /** Indicates if settlement or approval is partial. */
    isSettlementOrApprovalPartial: boolean;

    /** A flag to determine if the current page is a review for a suspected duplicate transaction. */
    isReviewDuplicateTransactionPage: boolean;
};

type CallbackFunctions = {
    /** Function to display the context menu in response to an event. */
    showContextMenu: (event: GestureResponderEvent) => void;

    /** Handles the UI response and data clean-up when the transaction goes offline. */
    offlineWithFeedbackOnClose: () => void;

    /** Navigates the user to a separate view or component for reviewing or editing transaction fields. */
    navigateToReviewFields: () => void;

    /** General callback for handling presses on the preview component, can also handle keyboard events. */
    onPreviewPressed: (event?: GestureResponderEvent | KeyboardEvent | undefined) => void;
};

type TransactionData = {
    /** Amount of money involved in the transaction, represented as a string. */
    displayAmount: string;

    /** Optional category label for the transaction. */
    category?: string;

    /** Indicator if the transaction was made via cash or card. */
    showCashOrCard: string;

    /** Optional tag for additional categorization or notes. */
    tag?: string;

    /** Currency in which the request was made. */
    requestCurrency?: string;

    /** Merchant's name or a description of the transaction. */
    merchantOrDescription: string;

    /** Header text displayed on the transaction preview, providing contextual information. */
    previewHeaderText: string;

    /** Optional detailed request amount, may differ from display amount based on currency conversions. */
    requestAmount?: number;

    /** Share of the split transaction owed by the current user, only applicable in split scenarios. */
    splitShare: number;
};

type TransactionPreviewUIProps = TransactionStatus &
    UIProps &
    TransactionData &
    CallbackFunctions & {
        /** Indicates if the transaction or document is currently being scanned. */
        isScanning: boolean;

        /** Whether the transaction is whisper. */
        isWhisper: boolean;

        /** Determines if the element is currently hovered over. */
        isHovered: boolean;

        /** Collection of thumbnail images linked to the transaction. */
        receiptImages: ThumbnailAndImageURI[];

        /** List of avatars representing participants in the transaction. */
        sortedParticipantAvatars: Icon[];

        /** Optional custom styles to be applied to container components. */
        containerStyles?: StyleProp<ViewStyle>;

        /** Optional message displayed next to RBR icon */
        RBRmessage?: string;

        /** Records any errors related to wallet terms. */
        walletTermsErrors: Errors | undefined;

        /** Represents any pending actions that need to be taken */
        pendingAction: PendingAction | undefined;

        /** Localization or translation function, essential for supporting multiple languages in UI. */
        translate: LocaleContextProps['translate'];
    };

export type {TransactionPreviewProps, TransactionPreviewUIProps};
