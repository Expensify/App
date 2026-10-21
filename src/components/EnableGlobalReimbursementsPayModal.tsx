import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getEnableGlobalReimbursementsBusinessNavigationRoute, getWiseGlobalReimbursementsIntroNavigationRoute} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
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
    const {isBetaEnabled} = usePermissions();
    const isModalOpenRef = useRef(false);

    const showCorpayPayModal = useEffectEvent(async (modalData: CorpayPayModal) => {
        if (isModalOpenRef.current) {
            return;
        }
        const navigationPathAtSignal = Navigation.getActiveRoute();

        // The signal arrives after a pay attempt, so betas are loaded; an unknown beta state should take the Corpay path.
        if (isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS)) {
            if (isAccountLocked) {
                showLockedAccountModal();
            } else {
                Navigation.navigate(getWiseGlobalReimbursementsIntroNavigationRoute(modalData.bankAccountID, navigationPathAtSignal), {skipMatchingFullScreenRoute: true});
            }
            clearCorpayPayModal();
            return;
        }

        isModalOpenRef.current = true;
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
