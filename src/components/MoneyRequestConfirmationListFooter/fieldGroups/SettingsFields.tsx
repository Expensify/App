import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ReportField from '@components/MoneyRequestConfirmationList/sections/ReportField';
import ToggleFields from '@components/MoneyRequestConfirmationList/sections/ToggleFields';
import type CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {FieldVisibility} from './fieldVisibility';

type SettingsFieldsProps = {
    /** Action being performed (drives section navigation targets) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the originating report action when editing */
    reportActionID: string | undefined;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Selected participants (drives ReportField presentation) */
    selectedParticipants: Participant[];

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the billable toggle should be displayed */
    shouldShowBillable: boolean;

    /** Whether the reimbursable toggle should be displayed */
    shouldShowReimbursable: boolean;

    /** Whether the surface is in a policy-expense chat (gates ReportField mount + its Onyx subs) */
    isPolicyExpenseChat: boolean;

    /** Whether the active transaction is a per-diem request */
    isPerDiemRequest: boolean;

    /** Callback when reimbursable is toggled */
    onToggleReimbursable?: (isOn: boolean) => void;

    /** Callback when billable is toggled */
    onToggleBillable?: (isOn: boolean) => void;

    /** When true, suppresses all fields in this group (all are below show-more) */
    isCompactMode: boolean;

    /** Per-field visibility decisions resolved by `computeFieldVisibility` */
    fieldVisibility: Pick<FieldVisibility, 'toggles' | 'report'>;
};

/**
 * Renders Toggles + ReportField — both below show-more, so the group returns null while compact.
 * Gating ReportField behind `isPolicyExpenseChat` keeps its 5 Onyx subscriptions
 * (including `COLLECTION.REPORT_NVP`) from instantiating on non-policy-expense flows.
 */
function SettingsFields({
    action,
    iouType,
    transactionID,
    reportID,
    reportActionID,
    transaction,
    selectedParticipants,
    isReadOnly,
    shouldShowBillable,
    shouldShowReimbursable,
    isPolicyExpenseChat,
    isPerDiemRequest,
    onToggleReimbursable,
    onToggleBillable,
    isCompactMode,
    fieldVisibility,
}: SettingsFieldsProps) {
    if (isCompactMode) {
        return null;
    }
    return (
        <>
            {fieldVisibility.toggles && (
                <ToggleFields
                    isReadOnly={isReadOnly}
                    shouldShowReimbursable={shouldShowReimbursable}
                    shouldShowBillable={shouldShowBillable}
                    onToggleReimbursable={onToggleReimbursable}
                    onToggleBillable={onToggleBillable}
                    transaction={transaction}
                />
            )}
            {fieldVisibility.report && (
                <ReportField
                    selectedParticipants={selectedParticipants}
                    isPolicyExpenseChat={isPolicyExpenseChat}
                    iouType={iouType}
                    reportID={reportID}
                    reportActionID={reportActionID}
                    action={action}
                    transactionID={transactionID}
                    transaction={transaction}
                    isPerDiemRequest={isPerDiemRequest}
                />
            )}
        </>
    );
}

export default SettingsFields;
