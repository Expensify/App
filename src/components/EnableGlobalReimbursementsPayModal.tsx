import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

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
    const [corpayPayModal] = useOnyx(ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);
    const {showConfirmModal} = useConfirmModal();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const isModalOpenRef = useRef(false);

    const showCorpayPayModal = useEffectEvent(async (bankAccountID: number) => {
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
            // Guard against a missing or malformed bankAccountID from the backend so the business page receives a
            // real bank account and can resolve its country. Also mirror WalletPage's account-lock guard so a
            // locked account sees the locked-account modal instead of walking into the business form.
            if (typeof bankAccountID !== 'number' || Number.isNaN(bankAccountID)) {
                clearCorpayPayModal();
                return;
            }
            if (isAccountLocked) {
                showLockedAccountModal();
                clearCorpayPayModal();
                return;
            }
            // Keep the corpayPayModal signal alive here so the business page can read bankCountry/bankCurrency
            // from it on mount. The business page consumes (clears) the signal once it has captured the values,
            // which lets the next pay attempt re-trigger this modal (Onyx skips notifications for deeply-equal
            // SETs, so the signal must transition null -> object each time).
            Navigation.navigate(
                ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(bankAccountID, CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER),
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
        showCorpayPayModal(corpayPayModal.bankAccountID);
    }, [corpayPayModal]);

    return null;
}

export default EnableGlobalReimbursementsPayModal;
