/**
 * Subscribes to BLOCKED_ROLE_CHANGE in Onyx and shows the blocked-reasons modal on the global modal stack
 * when the backend refuses an approve-only role change.
 */
import {clearBlockedRoleChange, clearUpdateMemberRoleError} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID = 'approveOnlyRoleBlocked';

const REASON_TRANSLATION_KEYS: Record<string, TranslationPaths> = {
    [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.HAS_CARD_ON_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.hasCardOnPolicy',
    [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_RESTRICTED_BY_DOMAIN_GROUP]: 'workspace.people.approveOnlyRoleBlockedReasons.isRestrictedByDomainGroup',
    [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_DEFAULT_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.isDefaultPolicy',
};

function useApproveOnlyRoleBlockedModal() {
    const {translate} = useLocalize();
    const {showConfirmModal, closeModalByID} = useConfirmModal();
    const [blockedRoleChange] = useOnyx(ONYXKEYS.BLOCKED_ROLE_CHANGE);
    const lastShownCreatedRef = useRef(0);
    const isModalOpenRef = useRef(false);

    useEffect(() => {
        if (!blockedRoleChange?.created) {
            if (isModalOpenRef.current) {
                isModalOpenRef.current = false;
                closeModalByID(APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID);
            }
            return;
        }

        if (lastShownCreatedRef.current === blockedRoleChange.created) {
            return;
        }
        lastShownCreatedRef.current = blockedRoleChange.created;
        isModalOpenRef.current = true;

        const {policyID, email, blockedReasons = []} = blockedRoleChange;

        // `OnyxUpdates.apply` runs `request.failureData` on the microtask after `response.onyxData`, which sets a
        // generic inline error on the member row. Clear that row error once `failureData` has settled so the modal
        // is the only feedback shown for a blocked role change.
        if (policyID && email) {
            Promise.resolve().then(() => {
                clearUpdateMemberRoleError(policyID, email);
            });
        }

        const reasonLines = blockedReasons.filter((reason) => reason in REASON_TRANSLATION_KEYS).map((reason) => `• ${translate(REASON_TRANSLATION_KEYS[reason])}`);
        const hasReasonLines = reasonLines.length > 0;

        showConfirmModal({
            id: APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID,
            title: translate('workspace.people.approveOnlyRoleBlockedTitle'),
            prompt: hasReasonLines ? [translate('workspace.people.approveOnlyRoleBlockedDescription'), '', ...reasonLines].join('\n') : translate('common.genericErrorMessage'),
            confirmText: translate(hasReasonLines ? 'workspace.people.approveOnlyRoleBlockedConfirm' : 'common.buttonConfirm'),
            shouldShowCancelButton: false,
        }).then(() => {
            isModalOpenRef.current = false;
            clearBlockedRoleChange();
        });
    }, [blockedRoleChange, closeModalByID, showConfirmModal, translate]);
}

export default useApproveOnlyRoleBlockedModal;
