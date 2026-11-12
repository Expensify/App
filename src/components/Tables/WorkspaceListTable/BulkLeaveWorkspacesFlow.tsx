import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateIsArchivedMap from '@hooks/usePrivateIsArchivedMap';

import {close} from '@libs/actions/Modal';
import {queueBulkLeavePolicy} from '@libs/actions/Policy/Policy';
import {isApproverOfOutstandingPolicyReports} from '@libs/ReportUtils';
import {getBulkActionSkippedWarning, getBulkLeaveWorkspacesWarnings} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useRef} from 'react';

import type {WorkspaceRowData} from '.';

import BulkActionConfirmationPrompt from './BulkActionConfirmationPrompt';

type BulkLeaveWorkspacesFlowProps = {
    /** Every selected workspace, including the ones the user can't leave */
    selectedRows: WorkspaceRowData[];

    /** IDs of the selected workspaces the user can leave */
    policyIDs: string[];

    /** Called after the user confirms leaving */
    onConfirm: () => void;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;
};

/**
 * Leave flow for several workspaces at once. Like LeaveWorkspaceFlow, it subscribes to the full policies only while it is mounted.
 */
function BulkLeaveWorkspacesFlow({selectedRows, policyIDs, onConfirm, onDismiss}: BulkLeaveWorkspacesFlowProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const privateIsArchivedMap = usePrivateIsArchivedMap();

    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current) {
            return;
        }
        hasStartedRef.current = true;

        close(() => {
            const userLogin = currentUserPersonalDetails.login ?? '';
            const getPolicy = (row: WorkspaceRowData) => policies?.[`${ONYXKEYS.COLLECTION.POLICY}${row.policyID}`];
            const rowsToLeave = selectedRows.filter((row) => policyIDs.includes(row.policyID));
            // Owners and archived workspaces are skipped for that reason, so only the rest are blocked by being the payer.
            const payerRows = selectedRows.filter(
                (row) =>
                    !policyIDs.includes(row.policyID) &&
                    !row.isArchived &&
                    row.ownerAccountID !== currentUserPersonalDetails.accountID &&
                    getPolicy(row)?.achAccount?.reimburser === userLogin,
            );
            const skippedWorkspaces = selectedRows.filter((row) => !policyIDs.includes(row.policyID) && !payerRows.includes(row)).map((row) => ({policyID: row.policyID, name: row.title}));

            const warnings = getBulkLeaveWorkspacesWarnings(
                [...rowsToLeave, ...payerRows].map((row) => ({
                    policyID: row.policyID,
                    policy: getPolicy(row),
                    name: row.title,
                    ownerDisplayName: row.ownerName ?? '',
                    isApproverOfOutstandingReports: isApproverOfOutstandingPolicyReports(
                        currentUserPersonalDetails.accountID,
                        outstandingReportsByPolicyID?.[row.policyID],
                        privateIsArchivedMap,
                    ),
                })),
                userLogin,
                translate,
            );
            const skippedWarning = getBulkActionSkippedWarning(policyIDs.length, selectedRows.length, skippedWorkspaces, translate);
            const allWarnings = skippedWarning ? [...warnings, skippedWarning] : warnings;

            showConfirmModal({
                title: translate('workspace.common.leaveWorkspacesTitle', {count: policyIDs.length}),
                prompt: allWarnings.length > 0 ? <BulkActionConfirmationPrompt warnings={allWarnings} /> : undefined,
                confirmText: translate('common.leave'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                shouldEnablePromptScroll: true,
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM) {
                    queueBulkLeavePolicy(
                        userLogin,
                        rowsToLeave.map((row) => ({id: row.policyID, pendingAction: row.pendingAction})),
                    );
                    onConfirm();
                }
                onDismiss();
            });
        });
    });

    return null;
}

export default BulkLeaveWorkspacesFlow;
