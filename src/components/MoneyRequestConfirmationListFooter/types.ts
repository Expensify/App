import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import type {AmountDisplay, CompactControls, DistanceData, DistanceFlags, ErrorState, ExpenseMode, ReceiptOptions, RequiredFlags, ToggleHandlers, VisibilityFlags} from './fieldGroupTypes';

/**
 * Props shared by the footer dispatcher and every footer variant. Declared here rather than in the
 * dispatcher module so a variant can type itself without importing the dispatcher that renders it.
 */
type MoneyRequestConfirmationListFooterProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** Error message from the odometer receipt stitcher, rendered below the receipt */
    receiptStitchError?: string | null;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Whether the active transaction is a scan request (drives compact mode) */
    isScanRequest: boolean;

    /** Input policy ID (passed to the Provider so leaf fields read tags/categories from the same policy the parent's validation uses) */
    policyID: string | undefined;

    /** Active policy (read by sections — may differ from `policyID` in track-expense flows where the user moves the expense to a different workspace) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Policy tag lists (resolved by the caller; passed in to avoid a duplicate Onyx subscription inside `ConfirmationFieldList`) */
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;

    /** Selected participants (drives ReportField + InvoiceSender presentation) */
    selectedParticipants: Participant[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether we're editing an existing split expense */
    isEditingSplitBill?: boolean;

    /** Whether the surface is in a policy-expense chat */
    isPolicyExpenseChat: boolean;

    /** What kind of expense the surface is confirming */
    expenseMode: ExpenseMode;

    /** Distance-mode discriminators (only meaningful when expenseMode.isDistance) */
    distanceFlags: DistanceFlags;

    /** Distance-rate metadata */
    distanceData: DistanceData;

    /** Pre-formatted amount values */
    amountDisplay: AmountDisplay;

    /** Per-field "required" flags */
    requiredFlags: RequiredFlags;

    /** Caller-supplied visibility decisions */
    visibilityFlags: VisibilityFlags;

    /** Error state */
    errorState: ErrorState;

    /** Toggle handlers */
    toggleHandlers?: ToggleHandlers;

    /** Receipt-related options */
    receiptOptions: ReceiptOptions;

    /** Compact-mode controls (the footer derives `isCompactMode` itself) */
    compactControls?: CompactControls;

    /** Scrolls the surface so an inline field's input is not hidden behind the keyboard when focused (new manual expense flow) */
    scrollFocusedInputIntoView?: (input: MeasurableInput) => void;

    /** Submits the whole expense (used by inline inputs to keep Enter-to-confirm on hardware-keyboard setups) */
    onSubmitForm?: () => void;

    /** Reports whether the inline tax amount field is currently empty, so submission can be blocked when it is left empty */
    onTaxAmountEmptyChange?: (isEmpty: boolean) => void;
};

type TimeFooterProps = Omit<
    MoneyRequestConfirmationListFooterProps,
    'receiptStitchError' | 'isScanRequest' | 'compactControls' | 'isEditingSplitBill' | 'expenseMode' | 'distanceFlags' | 'distanceData'
>;

type PerDiemFooterProps = Omit<
    MoneyRequestConfirmationListFooterProps,
    'receiptStitchError' | 'receiptOptions' | 'isScanRequest' | 'compactControls' | 'isEditingSplitBill' | 'expenseMode' | 'distanceFlags' | 'distanceData'
>;

export type {MoneyRequestConfirmationListFooterProps, TimeFooterProps, PerDiemFooterProps};
