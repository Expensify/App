import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
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

    /**
     * Whether the selectable rows render as the form's bordered fields instead of as push rows. The toggles stay
     * borderless either way — a toggle is not a value to pick — and group below Report rather than above it.
     */
    shouldUseDropdownRows: boolean;
};

/**
 * Renders Toggles + ReportField — both below show-more, so the group returns null while compact.
 * Gating ReportField behind `isPolicyExpenseChat` keeps its 5 Onyx subscriptions
 * (including `COLLECTION.REPORT_NVP`) from instantiating on non-policy-expense flows.
 */
function SettingsFields({selectedParticipants, shouldShowBillable, shouldShowReimbursable, toggleHandlers, isCompactMode, fieldVisibility, shouldUseDropdownRows}: SettingsFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, isPolicyExpenseChat, isPerDiemRequest} = useConfirmationFields();

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
            shouldUseDropdownRows={shouldUseDropdownRows}
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
