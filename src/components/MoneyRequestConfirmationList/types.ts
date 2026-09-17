import type {ReceiptOptions} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

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
    /** Runs the validation gate and the submit for the confirm button. The distance variant wraps this to add its own pre-submit guard. */
    onConfirm?: () => void;

    /** Opens the participant picker owned by the page hosting this list. Pages that cannot show an editable participant row pass a no-op. */
    onOpenParticipantPicker: () => void;

    /** Whether the parent-owned participant picker modal is currently open (new manual expense flow). Drives amount autofocus on picker close. */
    isParticipantPickerVisible?: boolean;

    /** The payment method the SettlementButton chose. Only reached by a PAY confirmation, which the residual variant serves. */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** Which IOU flow this confirmation belongs to. Defaults to SUBMIT, and decides the participant rows, the CTA copy and the submit path. */
    iouType?: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Writes the billable flag. Reached only through the billable toggle in the settings fields. */
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login. The participant rows fall back to the current user when it is absent. */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Should the list be read only, and not editable? Drops the confirm button entirely and the split amount inputs. */
    isReadOnly?: boolean;

    /** How many receipts this confirmation submits. Above one, the CTA reads as plural and a remove-this-expense button appears. */
    expensesNumber?: number;

    /** Policy ID the confirmation was opened with, usually the report's. The resolved policy can override it — see `useConfirmationPolicyData`. */
    policyID?: string;

    /** Report the expense is being submitted to. Feeds the report field and the payment button's chat. */
    reportID?: string;

    /** Everything the receipt section renders from. */
    receiptOptions?: ReceiptOptions;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is an odometer distance expense. The page owns that distinction, not the transaction. */
    isOdometerDistanceRequest?: boolean;

    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** Whether the expense is a per diem expense. Also true for a per diem being moved off a track expense, which confirms as a plain expense. */
    isPerDiemRequest?: boolean;

    /** Whether the expense is a time expense. Also true outside CREATE, where it confirms as a plain expense. */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** Whether we're outside the scan flow, which is what the name means here: false for a pure scan, true for a manual/per-diem/time confirmation. */
    shouldShowSmartScanFields?: boolean;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for splits, test receipts and moved tracked expenses. */
    canEnterScanFieldsManually?: boolean;

    /** ID of a partially filled Scan among the transactions being confirmed. Can be a receipt other than the one on screen. */
    partiallyManuallyFilledScanID?: string;

    /** Brings another of the confirmed transactions on screen, so its inline errors are the ones the user sees */
    onSwitchToTransaction?: (transactionID: string) => void;

    /** A flag for verifying that the current report is a sub-report of a expense chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smartscan failed on this receipt, which makes its empty required fields an error rather than a pending entry */
    hasSmartScanFailed?: boolean;

    /** The report action the confirmation edits from, threaded into the routes the field sections navigate to */
    reportActionID?: string;

    /** Which step of the IOU flow this is: CREATE, SPLIT or SUBMIT. A per diem confirmed at SUBMIT, for instance, confirms as a plain expense. */
    action?: IOUAction;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Writes the reimbursable flag. Reached only through the reimbursable toggle in the settings fields. */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Opens the modal that drops just this receipt out of a multi-receipt confirmation */
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section (e.g. when adding an expense directly to the current report) */
    shouldHideToSection?: boolean;
};

export type {MoneyRequestConfirmationListItem, MoneyRequestConfirmationListProps};
