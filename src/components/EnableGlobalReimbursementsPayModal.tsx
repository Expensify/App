import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

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

function EnableGlobalReimbursementsPayModal() {
    const {translate} = useLocalize();
    const [corpayPayModal] = useOnyx(ONYXKEYS.RAM_ONLY_CORPAY_PAY_MODAL);
    const {showConfirmModal} = useConfirmModal();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const isModalOpenRef = useRef(false);
    const pendingModalDataRef = useRef<CorpayPayModal | null>(null);
    const navigationPathAtSignalRef = useRef<string | undefined>(undefined);

    const showCorpayPayModal = useEffectEvent(async (modalData: CorpayPayModal) => {
        let nextModalData: CorpayPayModal | null = modalData;

        while (nextModalData) {
            if (isModalOpenRef.current) {
                pendingModalDataRef.current = nextModalData;
                return;
            }

            isModalOpenRef.current = true;
            navigationPathAtSignalRef.current = Navigation.getActiveRoute();
            const result = await showConfirmModal({
                title: translate('common.corpayPayModalTitle'),
                prompt: translate('common.corpayPayModalPrompt'),
                confirmText: translate('common.enableGlobalReimbursements'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            });
            isModalOpenRef.current = false;

            if (result.action === ModalActions.CONFIRM) {
                const {bankAccountID, bankCountry, bankCurrency} = nextModalData;
                if (typeof bankAccountID !== 'number' || Number.isNaN(bankAccountID)) {
                    clearCorpayPayModal();
                } else if (isAccountLocked) {
                    showLockedAccountModal();
                    clearCorpayPayModal();
                } else {
                    Navigation.navigate(
                        getEnableGlobalReimbursementsBusinessNavigationRoute(
                            bankAccountID,
                            CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.REGISTRATION_NUMBER,
                            {
                                bankCountry,
                                bankCurrency,
                            },
                            navigationPathAtSignalRef.current,
                        ),
                        {skipMatchingFullScreenRoute: true},
                    );
                    clearCorpayPayModal();
                }
            } else {
                clearCorpayPayModal();
            }

            nextModalData = pendingModalDataRef.current;
            pendingModalDataRef.current = null;
        }
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
