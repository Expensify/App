import type {LayoutChangeEvent, ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TransactionPreviewStyleType} from '@components/ReportActionItem/TransactionPreview/types';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';

type MoneyRequestReportPreviewStyleType = {
    flatListStyle: StyleProp<ViewStyle>;
    wrapperStyle: ViewStyle;
    contentContainerStyle: ViewStyle;
    transactionPreviewStyle: TransactionPreviewStyleType;
    componentStyle: StyleProp<ViewStyle>;
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
    MoneyRequestReportPreviewProps & {renderItem: ListRenderItem<Transaction>; getCurrentWidth: (e: LayoutChangeEvent) => void; reportPreviewStyles: MoneyRequestReportPreviewStyleType};

export type {MoneyRequestReportPreviewContentProps, MoneyRequestReportPreviewProps, MoneyRequestReportPreviewStyleType};
