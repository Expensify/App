import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsApproverOfOutstandingPolicyReports from '@hooks/useIsApproverOfOutstandingPolicyReports';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import {close} from '@libs/actions/Modal';
import {leaveWorkspace} from '@libs/actions/Policy/Policy';
import {getLeaveWorkspaceConfirmationPrompt} from '@libs/WorkspacesSettingsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {displayNameSelector} from '@src/selectors/PersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useEffect, useRef} from 'react';

type LeaveWorkspaceFlowProps = {
    /** ID of the workspace being left */
    policyID: string;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;

    /** Called after initiating departure, but not when cancelled or blocked by the reimburser restriction. */
    onLeave?: () => void;
};

/**
 * Self-contained "leave workspace" flow, mounted after the user selects Leave workspace from the workspace list, Members, or member details.
 * The full policy entry needed to build the confirmation prompt is subscribed to only for the
 * lifetime of the flow, so the workspaces list rows don't re-render on every policy change.
 */
function LeaveWorkspaceFlow({policyID, onDismiss, onLeave}: LeaveWorkspaceFlowProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const ownerAccountID = policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [policyOwnerDisplayName = ''] = usePersonalDetail(ownerAccountID, displayNameSelector);
    const isApproverOfOutstandingReports = useIsApproverOfOutstandingPolicyReports(policyID);

    const isLoadingData = isLoadingOnyxValue(policyResult);

    // The global confirmation can outlive this flow, but its parent callbacks must not run after unmount.
    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Closes the row popover (if still open) and shows the confirmation modal once the policy entry has loaded.
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        close(() => {
            const userLogin = currentUserPersonalDetails.login ?? '';
            const prompt = getLeaveWorkspaceConfirmationPrompt(policy, userLogin, policyOwnerDisplayName ?? '', translate, isApproverOfOutstandingReports);
            if (policy?.achAccount?.reimburser === userLogin) {
                showConfirmModal({
                    title: policy?.name ? translate('common.leaveWorkspaceTitle', policy.name) : translate('common.leaveWorkspace'),
                    prompt,
                    confirmText: translate('common.buttonConfirm'),
                    buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
                    shouldShowCancelButton: false,
                }).then(() => {
                    if (!isMountedRef.current) {
                        return;
                    }
                    onDismiss();
                });
                return;
            }

            showConfirmModal({
                title: policy?.name ? translate('common.leaveWorkspaceTitle', policy.name) : translate('common.leaveWorkspace'),
                prompt,
                confirmText: translate('common.leave'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM && policy) {
                    leaveWorkspace(currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '', policy);
                    if (isMountedRef.current) {
                        onLeave?.();
                    }
                }
                if (isMountedRef.current) {
                    onDismiss();
                }
            });
        });
    });

    return null;
}

export default LeaveWorkspaceFlow;
