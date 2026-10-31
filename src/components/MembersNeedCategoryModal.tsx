import useMembersNeedCategoryModal from '@hooks/useMembersNeedCategoryModal';
import useOnyx from '@hooks/useOnyx';

import {clearMembersNeedCategoryModal} from '@userActions/Policy/Category';

import ONYXKEYS from '@src/ONYXKEYS';
import type MembersNeedCategoryModalSignal from '@src/types/onyx/MembersNeedCategoryModal';

import {useEffect, useEffectEvent} from 'react';

/**
 * Shows the "Cannot disable category" modal when the backend rejects disabling categories, for example because another
 * admin changed visibility or the App's data was stale. Mounted once, so it shows whichever screen the admin is on.
 */
function MembersNeedCategoryModal() {
    const [modalSignal] = useOnyx(ONYXKEYS.RAM_ONLY_MEMBERS_NEED_CATEGORY_MODAL);
    const {showMembersNeedCategoryModal} = useMembersNeedCategoryModal(modalSignal?.policyID);

    // An effect event, so only a new signal shows the modal, not the member list or translations changing while it's open.
    const showModal = useEffectEvent((signal: MembersNeedCategoryModalSignal) => {
        showMembersNeedCategoryModal(signal.accountIDs, signal.categoryCount);
        clearMembersNeedCategoryModal();
    });

    useEffect(() => {
        if (!modalSignal) {
            return;
        }
        showModal(modalSignal);
    }, [modalSignal]);

    return null;
}

export default MembersNeedCategoryModal;
