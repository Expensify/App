import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import {clearCorpayPayModal} from '@userActions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type CorpayPayModal from '@src/types/onyx/CorpayPayModal';

import {useEffect, useEffectEvent, useRef} from 'react';

function EnableGlobalReimbursementsPayModal() {
    const {translate} = useLocalize();
    const [corpayPayModal] = useOnyx(ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);
    const {showConfirmModal} = useConfirmModal();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const isModalOpenRef = useRef(false);

    const showCorpayPayModal = useEffectEvent(async (modalData: CorpayPayModal) => {
        if (isModalOpenRef.current) {
            return;
        }
        isModalOpenRef.current = true;
        const result = await showConfirmModal({
            title: translate('common.corpayPayModalTitle'),
            prompt: translate('common.corpayPayModalPrompt'),
            confirmText: translate('common.enableGlobalReimbursements'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
        });
        isModalOpenRef.current = false;
        if (result.action === ModalActions.CONFIRM) {
            const {bankAccountID, bankCountry, bankCurrency} = modalData;
            if (typeof bankAccountID !== 'number' || Number.isNaN(bankAccountID)) {
                clearCorpayPayModal();
                return;
            }
            if (isAccountLocked) {
                showLockedAccountModal();
                clearCorpayPayModal();
                return;
            }
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(bankAccountID, CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER, undefined, {
                        bankCountry,
                        bankCurrency,
                    }),
                ),
                {skipMatchingFullScreenRoute: true},
            );
            return;
        }
        clearCorpayPayModal();
    });

    useEffect(() => {
        if (!corpayPayModal) {
            return;
        }
        showCorpayPayModal(corpayPayModal);
    }, [corpayPayModal]);

    return null;
}

export default EnableGlobalReimbursementsPayModal;
