import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getLastFourDigits, isWiseOnboardingSubmitted} from '@libs/BankAccountUtils';
import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import formatReportNamesAsBulletList from '@libs/formatReportNamesAsBulletList';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {getEnableGlobalReimbursementsBusinessNavigationRoute, getWiseGlobalReimbursementsIntroNavigationRoute} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearEnableGlobalReimbursementsModal, showEnableGlobalReimbursementsModal as showEnableGlobalReimbursementsModalAction} from '@userActions/App';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
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

        // Search bulk pay paid some reports and left these unpaid. It lists them here rather than in Search, because the responses can arrive after the admin left the Search page
        const {unpaidReportNames, accountNumber, ...bankAccount} = modalData;
        if (unpaidReportNames?.length) {
            clearEnableGlobalReimbursementsModal();
            deferModalPresentationAfterPopoverDismiss(() => {
                showConfirmModal({
                    title: translate('walletPage.wiseGlobalReimbursementsBulkPayModal.title', getLastFourDigits(accountNumber ?? '')),
                    subtitle: translate('walletPage.wiseGlobalReimbursementsBulkPayModal.description'),
                    prompt: formatReportNamesAsBulletList(unpaidReportNames),
                    confirmText: translate('walletPage.wiseGlobalReimbursementsIntro.getStarted'),
                    cancelText: translate('common.notNow'),
                    shouldEnablePromptScroll: true,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    showEnableGlobalReimbursementsModalAction(bankAccount);
                });
            });
            return;
        }

        const navigationPathAtSignal = Navigation.getActiveRoute();

        // The signal arrives after a pay attempt, so betas are loaded. An unknown beta state should take the Corpay path.
        if (isBetaEnabled(CONST.BETAS.WISE_REIMBURSEMENTS)) {
            if (isAccountLocked) {
                showLockedAccountModal();
            } else {
                const introRoute = getWiseGlobalReimbursementsIntroNavigationRoute(modalData.bankAccountID, navigationPathAtSignal, modalData.isPayingMultipleReports);
                // A business already submitted to Wise has nothing left to submit, so it sees where its onboarding stands instead of the intro
                const isOnboardingSubmitted = isWiseOnboardingSubmitted(bankAccountList?.[modalData.bankAccountID]?.accountData);
                Navigation.navigate(isOnboardingSubmitted ? createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path, introRoute) : introRoute, {
                    skipMatchingFullScreenRoute: true,
                });
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
