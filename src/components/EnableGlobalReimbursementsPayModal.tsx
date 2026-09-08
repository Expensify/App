import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getEnableGlobalReimbursementsBusinessNavigationRoute} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearCorpayPayModal} from '@userActions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type CorpayPayModal from '@src/types/onyx/CorpayPayModal';

import {useEffect, useEffectEvent, useRef} from 'react';

import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import {ModalActions} from './Modal/Global/ModalContext';

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
        const navigationPathAtSignal = Navigation.getActiveRoute();
        const result = await showConfirmModal({
            id: 'corpayPayModal',
            title: translate('common.corpayPayModalTitle'),
            prompt: translate('common.corpayPayModalPrompt'),
            confirmText: translate('common.enableGlobalReimbursements'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
        });
        isModalOpenRef.current = false;
        if (result.action === ModalActions.CONFIRM) {
            if (isAccountLocked) {
                showLockedAccountModal();
            } else {
                const {bankAccountID, bankCountry, bankCurrency} = modalData;
                Navigation.navigate(
                    getEnableGlobalReimbursementsBusinessNavigationRoute(
                        bankAccountID,
                        CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER,
                        {
                            bankCountry,
                            bankCurrency,
                        },
                        navigationPathAtSignal,
                    ),
                    {skipMatchingFullScreenRoute: true},
                );
            }
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
