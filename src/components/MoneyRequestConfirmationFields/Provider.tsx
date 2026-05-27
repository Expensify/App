import React from 'react';
import type {ReactNode} from 'react';
import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';
import ConfirmationFieldsContext from './context';

type ProviderProps = {
    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID?: string | undefined;

    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Policy ID associated with the active surface */
    policyID?: string | undefined;

    /** Whether the surface is read-only */
    isReadOnly?: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm?: boolean;

    /** Whether we're editing an existing split expense */
    isEditingSplitBill?: boolean;

    /** Whether the new manual expense flow beta is enabled */
    isNewManualExpenseFlowEnabled?: boolean;

    /** Whether the surface is in a policy-expense chat */
    isPolicyExpenseChat?: boolean;

    /** Block components rendered inside the Provider */
    children: ReactNode;
};

function Provider({
    transactionID,
    reportID,
    reportActionID,
    action,
    iouType,
    policyID,
    isReadOnly = false,
    didConfirm = false,
    isEditingSplitBill = false,
    isNewManualExpenseFlowEnabled = false,
    isPolicyExpenseChat = false,
    children,
}: ProviderProps) {
    const value = {
        transactionID,
        reportID,
        reportActionID,
        action,
        iouType,
        policyID,
        isReadOnly,
        didConfirm,
        isEditingSplitBill,
        isNewManualExpenseFlowEnabled,
        isPolicyExpenseChat,
    };
    return <ConfirmationFieldsContext.Provider value={value}>{children}</ConfirmationFieldsContext.Provider>;
}

export default Provider;
