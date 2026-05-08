import {createContext, useContext} from 'react';
import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';

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
    isNewManualExpenseFlowEnabled: boolean;
    isPolicyExpenseChat: boolean;
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
export type {ConfirmationFieldsContextValue};
