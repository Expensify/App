import type {ConfirmationFieldViewRefs} from '@components/MoneyRequestConfirmationList/hooks/useScrollToFlaggedField';
import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';

import {createContext, useContext} from 'react';

/** Reports that an inline input took focus. The getter returns that input, or null once it unmounts. */
type OnInlineInputFocus = (getInput: () => BaseTextInputRef | null) => void;

/**
 * Cross-cutting state for the money-request confirmation surface. Anything that
 * every block reads or that is part of "what surface am I" lives here so it
 * doesn't need to be re-threaded through prop chains.
 */
type ConfirmationFieldsContextValue = {
    // Identity — *what* is being confirmed
    transactionID: string | undefined;
    reportID: string;
    reportActionID: string | undefined;
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    policyID: string | undefined;

    // Coordination — *how* the surface is currently behaving
    isReadOnly: boolean;
    didConfirm: boolean;
    isEditingSplitBill: boolean;
    /** Whether this surface offers manual entry of the amount / merchant / date. False for splits, test receipts and moved tracked expenses. */
    canEnterScanFieldsManually: boolean;
    isPolicyExpenseChat: boolean;
    /** Whether the discard prompt covers the form, so the inline inputs go read-only and iOS can't raise a keyboard over it */
    isDiscardModalVisible: boolean;

    // Mode — *what kind* of expense is being confirmed
    isScanRequest: boolean;
    isDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isTypeInvoice: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isGPSDistanceRequest: boolean;

    /** Scrolls the surface so an inline field's input is not hidden behind the keyboard when focused (new manual expense flow). */
    scrollFocusedInputIntoView?: (input: MeasurableInput) => void;

    /** The refs the fields that show their own errors attach their outer view to, so a blocked confirm can scroll to them */
    fieldViewRefs?: ConfirmationFieldViewRefs;

    /** Submits the whole expense. Used by inline inputs to keep Enter-to-confirm on hardware-keyboard setups (new manual expense flow). */
    onSubmitForm?: () => void;

    /** Records the receipt whose inline tax amount input was emptied, or undefined once it holds a value, so submission can be blocked while it is left empty (new manual expense flow). */
    setEmptyTaxAmountTransactionID?: (transactionID: string | undefined) => void;

    /** Reports whether the inline amount field holds input the draft can't show as the user's: a sign with no digits, or a currency the user picked (new manual expense flow). */
    onUnsavedAmountInputChange?: (hasUnsavedInput: boolean) => void;

    /** Reports the inline input that took focus, so cancelling the discard prompt can put focus back in it (new manual expense flow). */
    onInlineInputFocus?: OnInlineInputFocus;
};

const ConfirmationFieldsContext = createContext<ConfirmationFieldsContextValue | null>(null);

function useConfirmationFields(): ConfirmationFieldsContextValue {
    const value = useContext(ConfirmationFieldsContext);
    if (!value) {
        throw new Error('ConfirmationFields components must be rendered inside <ConfirmationFields.Provider>');
    }
    return value;
}

export default ConfirmationFieldsContext;
export {useConfirmationFields};
export type {OnInlineInputFocus};
