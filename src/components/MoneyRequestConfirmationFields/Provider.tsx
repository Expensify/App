import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {IOUAction, IOUType} from '@src/CONST';
import type CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

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

    /** Whether the active transaction is a distance request */
    isDistanceRequest?: boolean;

    /** Whether the active transaction is a per-diem request */
    isPerDiemRequest?: boolean;

    /** Whether the active transaction is a time request */
    isTimeRequest?: boolean;

    /** Whether the surface is confirming an invoice */
    isTypeInvoice?: boolean;

    /** Whether the active transaction is a manual distance request */
    isManualDistanceRequest?: boolean;

    /** Whether the active transaction is an odometer-driven distance request */
    isOdometerDistanceRequest?: boolean;

    /** Whether the active transaction is a GPS distance request */
    isGPSDistanceRequest?: boolean;

    /** Scrolls the surface so an inline field's input is not hidden behind the keyboard when focused (new manual expense flow) */
    scrollFocusedInputIntoView?: (input: MeasurableInput) => void;

    /** Submits the whole expense (used by inline inputs to keep Enter-to-confirm on hardware-keyboard setups) */
    onSubmitForm?: () => void;

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
    isDistanceRequest = false,
    isPerDiemRequest = false,
    isTimeRequest = false,
    isTypeInvoice = false,
    isManualDistanceRequest = false,
    isOdometerDistanceRequest = false,
    isGPSDistanceRequest = false,
    scrollFocusedInputIntoView,
    onSubmitForm,
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
        isDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isTypeInvoice,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isGPSDistanceRequest,
        scrollFocusedInputIntoView,
        onSubmitForm,
    };
    return <ConfirmationFieldsContext.Provider value={value}>{children}</ConfirmationFieldsContext.Provider>;
}

export default Provider;
