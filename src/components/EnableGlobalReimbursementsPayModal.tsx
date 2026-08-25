import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';

import {clearCorpayPayModal} from '@userActions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useEffect, useEffectEvent, useRef} from 'react';

function EnableGlobalReimbursementsPayModal() {
    const {translate} = useLocalize();
    const [corpayPayModal] = useOnyx(ONYXKEYS.CORPAY_PAY_MODAL);
    const {showConfirmModal} = useConfirmModal();
    const isModalOpenRef = useRef(false);

    const showCorpayPayModal = useEffectEvent((bankAccountID: number | undefined) => {
        if (isModalOpenRef.current) {
            return;
        }
        isModalOpenRef.current = true;
        showConfirmModal({
            title: translate('common.corpayPayModalTitle'),
            prompt: translate('common.corpayPayModalPrompt'),
            confirmText: translate('common.enableGlobalReimbursements'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
        }).then((result) => {
            isModalOpenRef.current = false;
            if (result.action === 'CONFIRM') {
                Navigation.navigate(
                    ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(bankAccountID, CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER),
                );
            }
            clearCorpayPayModal();
        });
    });

    useEffect(() => {
        if (!corpayPayModal) {
            return;
        }
        showCorpayPayModal(corpayPayModal.bankAccountID);
    }, [corpayPayModal]);

    return null;
}

export default EnableGlobalReimbursementsPayModal;
