import {useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {close} from '@libs/actions/Modal';
import {leaveWorkspace} from '@libs/actions/Policy/Policy';
import {getLeaveWorkspaceConfirmationPrompt} from '@libs/WorkspacesSettingsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type LeaveWorkspaceActionProps = {
    /** ID of the workspace being left */
    policyID: string;

    /** Called when the flow is finished or abandoned, so the parent can unmount this component */
    onDismiss: () => void;
};

const ownerDisplayNameSelector = (ownerAccountID: number) => (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[ownerAccountID]?.displayName ?? '';

/**
 * Self-contained "leave workspace" flow, mounted only after the user picks Leave in the row menu.
 * The full policy entry needed to build the confirmation prompt is subscribed to only for the
 * lifetime of the flow, so the workspaces list rows don't re-render on every policy change.
 */
function LeaveWorkspaceAction({policyID, onDismiss}: LeaveWorkspaceActionProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [session, sessionResult] = useOnyx(ONYXKEYS.SESSION);
    const [policy, policyResult] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const ownerAccountID = policy?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [policyOwnerDisplayName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: ownerDisplayNameSelector(ownerAccountID)}, [ownerAccountID]);

    const isLoadingData = isLoadingOnyxValue(sessionResult, policyResult);

    // Closes the row popover (if still open) and shows the confirmation modal once the policy entry has loaded.
    const hasStartedRef = useRef(false);
    useEffect(() => {
        if (hasStartedRef.current || isLoadingData) {
            return;
        }
        hasStartedRef.current = true;

        close(() => {
            const userEmail = session?.email ?? '';
            const prompt = getLeaveWorkspaceConfirmationPrompt(policy, userEmail, policyOwnerDisplayName ?? '', translate);
            if (policy?.achAccount?.reimburser === userEmail) {
                showConfirmModal({
                    title: translate('common.leaveWorkspace'),
                    prompt: prompt,
                    confirmText: translate('common.buttonConfirm'),
                    success: true,
                    shouldShowCancelButton: false,
                }).then(() => onDismiss());
                return;
            }

            showConfirmModal({
                title: translate('common.leaveWorkspace'),
                prompt: prompt,
                confirmText: translate('common.leaveWorkspace'),
                cancelText: translate('common.cancel'),
                danger: true,
            }).then((result) => {
                if (result.action === ModalActions.CONFIRM && policy) {
                    leaveWorkspace(session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '', policy);
                }
                onDismiss();
            });
        });
    });

    return null;
}

export default LeaveWorkspaceAction;
