import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {canContinueWiseOnboarding} from '@libs/BankAccountUtils';
import {getEnableGlobalReimbursementsBusinessNavigationRoute, getWiseGlobalReimbursementsIntroNavigationRoute} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import navigateToWiseGlobalReimbursements from '@libs/Navigation/helpers/navigateToWiseGlobalReimbursements';
import Navigation from '@libs/Navigation/Navigation';

import {clearEnableGlobalReimbursementsModal} from '@userActions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type EnableGlobalReimbursementsModal from '@src/types/onyx/EnableGlobalReimbursementsModal';

import {useEffect, useEffectEvent, useRef} from 'react';

import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import {ModalActions} from './Modal/Global/ModalContext';

function EnableGlobalReimbursementsPayModal() {
    const {translate} = useLocalize();
    const [enableGlobalReimbursementsModal] = useOnyx(ONYXKEYS.RAM_ONLY_ENABLE_GLOBAL_REIMBURSEMENTS_MODAL);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const {showConfirmModal} = useConfirmModal();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isBetaEnabled} = usePermissions();
    const isModalOpenRef = useRef(false);

    const showEnableGlobalReimbursementsModal = useEffectEvent(async (modalData: EnableGlobalReimbursementsModal) => {
        if (isModalOpenRef.current) {
            return;
        }
        const navigationPathAtSignal = Navigation.getActiveRoute();

        // The signal arrives after a pay attempt, so betas are loaded. An unknown beta state should take the Corpay path.
        if (isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS)) {
            if (isAccountLocked) {
                showLockedAccountModal();
            } else {
                navigateToWiseGlobalReimbursements(
                    getWiseGlobalReimbursementsIntroNavigationRoute(modalData.bankAccountID, navigationPathAtSignal),
                    canContinueWiseOnboarding(bankAccountList?.[modalData.bankAccountID]),
                    {skipMatchingFullScreenRoute: true},
                );
            }
            clearEnableGlobalReimbursementsModal();
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
        clearEnableGlobalReimbursementsModal();
    });

    useEffect(() => {
        if (!enableGlobalReimbursementsModal) {
            return;
        }
        showEnableGlobalReimbursementsModal(enableGlobalReimbursementsModal);
    }, [enableGlobalReimbursementsModal]);

    return null;
}

export default EnableGlobalReimbursementsPayModal;
