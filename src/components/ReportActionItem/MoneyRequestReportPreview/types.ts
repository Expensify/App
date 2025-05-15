import type {LayoutChangeEvent, ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TransactionPreviewStyleType} from '@components/ReportActionItem/TransactionPreview/types';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

type TransactionPreviewStyle = {
    [key in keyof TransactionPreviewStyleType]: number;
};

type MoneyRequestReportPreviewStyleType = {
    flatListStyle: StyleProp<ViewStyle>;
    wrapperStyle: ViewStyle;
    contentContainerStyle: ViewStyle;
    transactionPreviewStyle: TransactionPreviewStyle;
    componentStyle: StyleProp<ViewStyle>;
    expenseCountVisible: boolean;
};

type MoneyRequestReportPreviewProps = {
    /** The report's policyID, used for Onyx subscription */
    policyID: string | undefined;

    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string | undefined;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

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
    violations: OnyxCollection<TransactionViolation[]>;
    policy: OnyxEntry<Policy>;
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails>;
    lastTransactionViolations: TransactionViolations;
    isDelegateAccessRestricted: boolean;
};

type MoneyRequestReportPreviewContentProps = MoneyRequestReportPreviewContentOnyxProps &
    Omit<MoneyRequestReportPreviewProps, 'policyID'> & {
        /** Extra styles passed used by MoneyRequestReportPreviewContent */
        reportPreviewStyles: MoneyRequestReportPreviewStyleType;

        /** MoneyRequestReportPreview's current width */
        currentWidth: number;

        /** Callback passed to Carousel's onLayout  */
        onCarouselLayout: (e: LayoutChangeEvent) => void;

        /** Callback passed to Component wrapper view's onLayout */
        onWrapperLayout: (e: LayoutChangeEvent) => void;

        /** Callback to render a transaction preview item */
        renderTransactionItem: ListRenderItem<Transaction>;

        /** Callback called when the whole preview is pressed */
        onPress: () => void;
    };

export type {MoneyRequestReportPreviewContentProps, MoneyRequestReportPreviewProps, MoneyRequestReportPreviewStyleType};
