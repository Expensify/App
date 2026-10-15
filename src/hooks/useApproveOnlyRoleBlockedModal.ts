import {clearBlockedRoleChange, clearUpdateMemberRoleError} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const BLOCKED_ROLE_CHANGE_MAX_AGE_MS = 60_000;
const APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID = 'approveOnlyRoleBlocked';

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

        if (Date.now() - blockedRoleChange.created > BLOCKED_ROLE_CHANGE_MAX_AGE_MS) {
            clearBlockedRoleChange();
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

        const reasonTranslationKeys: Record<string, TranslationPaths> = {
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.HAS_CARD_ON_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.hasCardOnPolicy',
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_RESTRICTED_BY_DOMAIN_GROUP]: 'workspace.people.approveOnlyRoleBlockedReasons.isRestrictedByDomainGroup',
            [CONST.POLICY.APPROVE_ONLY_BLOCKED_REASONS.IS_DEFAULT_POLICY]: 'workspace.people.approveOnlyRoleBlockedReasons.isDefaultPolicy',
        };
        const reasonLines = blockedReasons.filter((reason) => reason in reasonTranslationKeys).map((reason) => `• ${translate(reasonTranslationKeys[reason])}`);

        const modalPromise =
            reasonLines.length === 0
                ? showConfirmModal({
                      id: APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID,
                      title: translate('workspace.people.approveOnlyRoleBlockedTitle'),
                      prompt: translate('common.genericErrorMessage'),
                      confirmText: translate('common.buttonConfirm'),
                      shouldShowCancelButton: false,
                  })
                : showConfirmModal({
                      id: APPROVE_ONLY_ROLE_BLOCKED_MODAL_ID,
                      title: translate('workspace.people.approveOnlyRoleBlockedTitle'),
                      prompt: [translate('workspace.people.approveOnlyRoleBlockedDescription'), '', ...reasonLines].join('\n'),
                      confirmText: translate('workspace.people.approveOnlyRoleBlockedConfirm'),
                      shouldShowCancelButton: false,
                  });

        modalPromise.then(() => {
            isModalOpenRef.current = false;
            clearBlockedRoleChange(policyID, email);
        });
    }, [blockedRoleChange, closeModalByID, showConfirmModal, translate]);
}

export default useApproveOnlyRoleBlockedModal;
