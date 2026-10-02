import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {useExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import ReportField from '@components/MoneyRequestConfirmationList/sections/ReportField';
import ToggleFields from '@components/MoneyRequestConfirmationList/sections/ToggleFields';
import type {ToggleHandlers} from '@components/MoneyRequestConfirmationListFooter/fieldGroupTypes';

import type {Participant} from '@src/types/onyx/IOU';

import React from 'react';

import type {FieldVisibility} from './fieldVisibility';

type SettingsFieldsProps = {
    /** Selected participants (drives ReportField presentation) */
    selectedParticipants: Participant[];

    shouldShowBillable: boolean;
    shouldShowReimbursable: boolean;

    /** Toggle callbacks for billable/reimbursable */
    toggleHandlers: ToggleHandlers;

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
function SettingsFields({selectedParticipants, shouldShowBillable, shouldShowReimbursable, toggleHandlers, isCompactMode, fieldVisibility}: SettingsFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, isPolicyExpenseChat, isPerDiemRequest} = useConfirmationFields();
    // The toggles stay borderless whichever presentation the form uses, since a toggle is not a value to pick. What
    // the dropdown-row form does change is their place: they group below Report rather than above it.
    const {shouldUseDropdownRows} = useExpenseFormLayout();

    if (isCompactMode) {
        return null;
    }

    const toggles = fieldVisibility.toggles ? (
        <ToggleFields
            isReadOnly={isReadOnly}
            shouldShowReimbursable={shouldShowReimbursable}
            shouldShowBillable={shouldShowBillable}
            onToggleReimbursable={toggleHandlers.onToggleReimbursable}
            onToggleBillable={toggleHandlers.onToggleBillable}
            transactionID={transactionID}
        />
    ) : null;

    const report = fieldVisibility.report ? (
        <ReportField
            selectedParticipants={selectedParticipants}
            isPolicyExpenseChat={isPolicyExpenseChat}
            iouType={iouType}
            reportID={reportID}
            reportActionID={reportActionID}
            action={action}
            transactionID={transactionID}
            isPerDiemRequest={isPerDiemRequest}
        />
    ) : null;

    // The toggles group at the bottom of the dropdown-row form, so Report comes first there.
    return shouldUseDropdownRows ? (
        <>
            {report}
            {toggles}
        </>
    ) : (
        <>
            {toggles}
            {report}
        </>
    );
}

export default SettingsFields;
