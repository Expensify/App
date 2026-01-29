import type {LayoutChangeEvent, ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TransactionPreviewStyleType} from '@components/ReportActionItem/TransactionPreview/types';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolations} from '@src/types/onyx';

type TransactionPreviewCarouselStyle = {
    [key in keyof TransactionPreviewStyleType]: number;
};

type TransactionPreviewStandaloneStyle = {
    [key in keyof TransactionPreviewStyleType]: string;
};

type MoneyRequestReportPreviewStyleType = {
    flatListStyle: StyleProp<ViewStyle>;
    wrapperStyle: ViewStyle;
    contentContainerStyle: ViewStyle;
    transactionPreviewCarouselStyle: TransactionPreviewCarouselStyle;
    transactionPreviewStandaloneStyle: TransactionPreviewStandaloneStyle;
    componentStyle: StyleProp<ViewStyle>;
    expenseCountVisible: boolean;
};

type MoneyRequestReportPreviewProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<Report>;

    /** All the data of the policy collection */
    policies: OnyxCollection<Policy>;

    /** The report's policyID, used for Onyx subscription */
    policyID: string | undefined;

    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string | undefined;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Callback when the payment options popover is shown */
    onPaymentOptionsShow?: () => void;

    /** Callback when the payment options popover is closed */
    onPaymentOptionsHide?: () => void;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;

    /** Whether  context menu should be shown on press */
    shouldDisplayContextMenu?: boolean;

    /** Whether the report is an invoice preview */
    isInvoice?: boolean;

    /** Whether to show a border to separate Reports Chat Item and Money Request Report Preview */
    shouldShowBorder?: boolean;
};

type MoneyRequestReportPreviewContentOnyxProps = {
    chatReport: OnyxEntry<Report>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    iouReport: OnyxEntry<Report>;
    transactions: Transaction[];
    policy: OnyxEntry<Policy>;
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails> | null;
    lastTransactionViolations: TransactionViolations;
};

type MoneyRequestReportPreviewContentProps = MoneyRequestReportPreviewContentOnyxProps &
    Omit<MoneyRequestReportPreviewProps, 'allReports' | 'policies' | 'policyID'> &
    ForwardedFSClassProps & {
        /** Extra styles passed used by MoneyRequestReportPreviewContent */
        reportPreviewStyles: MoneyRequestReportPreviewStyleType;

        /** MoneyRequestReportPreview's current width */
        currentWidth: number;

        /** Extra styles to pass to View wrapper */
        containerStyles?: StyleProp<ViewStyle>;

        /** Callback passed to Carousel's onLayout  */
        onCarouselLayout: (e: LayoutChangeEvent) => void;

        /** Callback passed to Component wrapper view's onLayout */
        onWrapperLayout: (e: LayoutChangeEvent) => void;

        /** Callback to render a transaction preview item */
        renderTransactionItem: ListRenderItem<Transaction>;

        /** Callback called when the whole preview is pressed */
        onPress: () => void;

        /** IDs of newly added transactions */
        newTransactionIDs?: string[];
    };

export type {MoneyRequestReportPreviewContentProps, MoneyRequestReportPreviewProps, MoneyRequestReportPreviewStyleType};
