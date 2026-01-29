import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useCloseReactNativeApp from '@hooks/useCloseReactNativeApp';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setIsOpenConfirmNavigateExpensifyClassicModalOpen} from '@libs/actions/isOpenConfirmNavigateExpensifyClassicModal';
import {openOldDotLink} from '@libs/actions/Link';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function BaseConfirmNavigateExpensifyClassicModal() {
    const [isOpenAppConfirmNavigateExpensifyClassicModalOpen = false] = useOnyx(ONYXKEYS.IS_OPEN_CONFIRM_NAVIGATE_EXPENSIFY_CLASSIC_MODAL_OPEN, {canBeMissing: true});
    const {translate} = useLocalize();
    const {closeReactNativeAppWithGPSCheck} = useCloseReactNativeApp();

    const handleConfirm = () => {
        setIsOpenConfirmNavigateExpensifyClassicModalOpen(false);
        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeAppWithGPSCheck({shouldSetNVP: true});
            return;
        }
        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
    };

    const handleCancel = () => {
        setIsOpenConfirmNavigateExpensifyClassicModalOpen(false);
    };

    return (
        <ConfirmModal
            prompt={translate('sidebarScreen.redirectToExpensifyClassicModal.description')}
            isVisible={isOpenAppConfirmNavigateExpensifyClassicModalOpen}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            title={translate('sidebarScreen.redirectToExpensifyClassicModal.title')}
            confirmText={translate('exitSurvey.goToExpensifyClassic')}
            cancelText={translate('common.cancel')}
        />
    );
}

export default BaseConfirmNavigateExpensifyClassicModal;
