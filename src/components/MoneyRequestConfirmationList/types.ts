import type {OptionData} from '@libs/ReportUtils';

import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

/** A row of the confirmation list. Rows are participants only — every expense field is rendered in the list footer. */
type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

/** The props every confirmation list variant is handed by the page hosting it. */
type MoneyRequestConfirmationListProps = {
    /** Callback to inform parent modal of success */
    onConfirm?: () => void;

    /** Opens the participant picker owned by the page hosting this list. Pages that cannot show an editable participant row pass a no-op. */
    onOpenParticipantPicker: () => void;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow). Drives amount autofocus on picker close. */
    isParticipantPickerVisible?: boolean;

    /** Callback to parent modal to pay someone */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? */
    isReadOnly?: boolean;

    expensesNumber?: number;
    policyID?: string;
    reportID?: string;

    /** File path of the receipt */
    receiptPath?: string | number;

    receiptFilename?: string;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is an odometer distance expense */
    isOdometerDistanceRequest?: boolean;

    /** Whether the odometer receipt is currently being stitched */
    isLoadingReceipt?: boolean;

    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** Whether the expense is a per diem expense */
    isPerDiemRequest?: boolean;

    /** Whether the expense is a time expense */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we can navigate to receipt page */
    shouldDisplayReceipt?: boolean;

    /** Whether we should show the amount, date, and merchant fields. */
    shouldShowSmartScanFields?: boolean;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for splits, test receipts and moved tracked expenses. */
    canEnterScanFieldsManually?: boolean;

    /** ID of a partially filled Scan among the transactions being confirmed. Can be a receipt other than the one on screen. */
    partiallyManuallyFilledScanID?: string;

    /** Brings another of the confirmed transactions on screen, so its inline errors are the ones the user sees */
    onSwitchToTransaction?: (transactionID: string) => void;

    /** A flag for verifying that the current report is a sub-report of a expense chat */
    isPolicyExpenseChat?: boolean;

    hasSmartScanFailed?: boolean;
    reportActionID?: string;
    action?: IOUAction;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Whether the receipt can be replaced */
    isReceiptEditable?: boolean;

    onPDFLoadError?: () => void;
    onPDFPassword?: () => void;
    onToggleReimbursable?: (isOn: boolean) => void;
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section (e.g. when adding an expense directly to the current report) */
    shouldHideToSection?: boolean;
};

/**
 * What a per-diem confirmation reads. The rest of what the page hands the dispatcher cannot affect this surface:
 * the receipt props because per diem shows no receipt, the scan props because it is never a scan, and
 * `onSendMoney` / `onOpenParticipantPicker` because neither can be invoked here.
 */
type PerDiemConfirmationListProps = Pick<
    MoneyRequestConfirmationListProps,
    | 'transaction'
    | 'action'
    | 'iouType'
    | 'policyID'
    | 'reportID'
    | 'reportActionID'
    | 'selectedParticipants'
    | 'payeePersonalDetails'
    | 'isReadOnly'
    | 'isPolicyExpenseChat'
    | 'expensesNumber'
    | 'isConfirmed'
    | 'isConfirming'
    | 'shouldShowSmartScanFields'
    | 'canEnterScanFieldsManually'
    | 'shouldHideToSection'
    | 'onConfirm'
    | 'onToggleBillable'
    | 'onToggleReimbursable'
    | 'showRemoveExpenseConfirmModal'
>;

/**
 * What a time confirmation reads. It keeps the receipt props, which per diem does not, because `TimeFooter`
 * renders a receipt section. It drops the scan props, `onSendMoney` (the time tab is only offered for SUBMIT and
 * CREATE) and `onOpenParticipantPicker` (its participant row can never be edited).
 */
type TimeConfirmationListProps = Pick<
    MoneyRequestConfirmationListProps,
    | 'transaction'
    | 'action'
    | 'iouType'
    | 'policyID'
    | 'reportID'
    | 'reportActionID'
    | 'selectedParticipants'
    | 'payeePersonalDetails'
    | 'isReadOnly'
    | 'isPolicyExpenseChat'
    | 'expensesNumber'
    | 'isConfirmed'
    | 'isConfirming'
    | 'shouldShowSmartScanFields'
    | 'canEnterScanFieldsManually'
    | 'shouldHideToSection'
    | 'receiptPath'
    | 'receiptFilename'
    | 'isReceiptEditable'
    | 'shouldDisplayReceipt'
    | 'isLoadingReceipt'
    | 'onPDFLoadError'
    | 'onPDFPassword'
    | 'onConfirm'
    | 'onToggleBillable'
    | 'onToggleReimbursable'
    | 'showRemoveExpenseConfirmModal'
>;

/**
 * What a scan confirmation reads. Scan is the widest variant — the only one that reaches compact mode and the
 * multi-scan inline-error switch — so it drops only what belongs to the other types: the odometer stitch error
 * and the per-diem, time and odometer flags.
 */
type ScanConfirmationListProps = Omit<MoneyRequestConfirmationListProps, 'receiptStitchError' | 'isPerDiemRequest' | 'isTimeRequest' | 'isOdometerDistanceRequest'>;

/**
 * What a manual confirmation reads. It keeps `isPerDiemRequest` and `isTimeRequest` because it is the residual
 * case — a per diem moved off a track expense and a time expense outside CREATE both confirm here, and those
 * flags still decide whether the amount, merchant and tax fields are shown. It drops the scan props and the
 * odometer stitch error, since a manual expense is neither.
 */
type ManualConfirmationListProps = Omit<
    MoneyRequestConfirmationListProps,
    'receiptStitchError' | 'isOdometerDistanceRequest' | 'canEnterScanFieldsManually' | 'partiallyManuallyFilledScanID' | 'hasSmartScanFailed' | 'onSwitchToTransaction'
>;

/**
 * What an invoice confirmation reads. An invoice is always a manual expense and can never be a split or a
 * payment, so it drops `iouType` (it is always INVOICE), `onSendMoney`, `isEditingSplitBill`, the scan props and
 * the odometer stitch error.
 */
type InvoiceConfirmationListProps = Omit<
    MoneyRequestConfirmationListProps,
    | 'iouType'
    | 'onSendMoney'
    | 'isEditingSplitBill'
    | 'receiptStitchError'
    | 'isPerDiemRequest'
    | 'isTimeRequest'
    | 'isOdometerDistanceRequest'
    | 'canEnterScanFieldsManually'
    | 'partiallyManuallyFilledScanID'
    | 'hasSmartScanFailed'
    | 'onSwitchToTransaction'
>;

export type {
    MoneyRequestConfirmationListItem,
    MoneyRequestConfirmationListProps,
    PerDiemConfirmationListProps,
    TimeConfirmationListProps,
    ScanConfirmationListProps,
    ManualConfirmationListProps,
    InvoiceConfirmationListProps,
};
