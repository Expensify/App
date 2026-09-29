import type {ReceiptOptions} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type {OptionData} from '@libs/ReportUtils';

import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

/** A row of the confirmation list. */
type MoneyRequestConfirmationListItem = (Participant & {keyForList: string}) | OptionData;

type MoneyRequestConfirmationListProps = {
    /** Runs validation and submits. */
    onConfirm?: () => void;

    /** Opens the participant picker owned by the page. */
    onOpenParticipantPicker: () => void;

    /** Whether the page participant picker is open. */
    isParticipantPickerVisible?: boolean;

    /** The payment method the SettlementButton chose. */
    onSendMoney?: (paymentMethod: PaymentMethodType | undefined) => void;

    /** The IOU flow being confirmed. */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Writes the billable flag from the settings-fields toggle */
    onToggleBillable?: (isOn: boolean) => void;

    /** Selected participants from MoneyRequestModal with login / accountID */
    selectedParticipants: Participant[];

    /** Payee of the expense with login. The participant rows fall back to the current user when absent. */
    payeePersonalDetails?: OnyxEntry<OnyxTypes.PersonalDetails> | null;

    /** Read-only list: no confirm button, no editable split amounts */
    isReadOnly?: boolean;

    /** How many receipts this confirmation submits. Above one, the CTA reads as plural and a remove-this-expense button appears. */
    expensesNumber?: number;

    /** Policy ID the confirmation was opened with. */
    policyID?: string;

    /** Report the expense is submitted to. */
    reportID?: string;

    /** Everything the receipt section renders from. */
    receiptOptions: ReceiptOptions;

    /** Transaction that represents the expense */
    transaction?: OnyxEntry<OnyxTypes.Transaction>;

    /** Whether the expense is an odometer distance expense. */
    isOdometerDistanceRequest?: boolean;

    /** Error from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** Per diem expense. Also true while it is being moved off a track expense, where it confirms as a plain expense. */
    isPerDiemRequest?: boolean;

    /** Time expense. Also true outside CREATE, where it confirms as a plain expense. */
    isTimeRequest?: boolean;

    /** Whether we're editing a split expense */
    isEditingSplitBill?: boolean;

    /** True for every non-scan expense. For a scan the page computes it from whether the fields can be entered by hand. */
    shouldShowSmartScanFields?: boolean;

    /** Whether manual entry of amount / merchant / date is offered. */
    canEnterScanFieldsManually?: boolean;

    /** ID of a partially filled Scan among the transactions being confirmed. */
    partiallyManuallyFilledScanID?: string;

    /** Brings another confirmed transaction on screen. */
    onSwitchToTransaction?: (transactionID: string) => void;

    /** Whether the current report is a sub-report of an expense chat */
    isPolicyExpenseChat?: boolean;

    /** Whether smartscan failed on this receipt. */
    hasSmartScanFailed?: boolean;

    /** The report action being edited from. */
    reportActionID?: string;

    /** CREATE, SPLIT or SUBMIT */
    action: IOUAction;

    /** Whether the expense is confirmed or not */
    isConfirmed?: boolean;

    /** Whether the expense is in the process of being confirmed */
    isConfirming?: boolean;

    /** Writes the reimbursable flag from the settings-fields toggle */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Opens the modal that drops this receipt out of a multi-receipt confirmation */
    showRemoveExpenseConfirmModal?: () => void;

    /** When true, hide the "To:" section */
    shouldHideToSection?: boolean;
};

export type {MoneyRequestConfirmationListItem, MoneyRequestConfirmationListProps};
