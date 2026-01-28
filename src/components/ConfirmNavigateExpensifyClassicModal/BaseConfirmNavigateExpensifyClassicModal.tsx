import React from 'react';
import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {setIsOpenConfirmNavigateExpensifyClassicModalOpen} from '@libs/actions/isOpenConfirmNavigateExpensifyClassicModal';
import {openOldDotLink} from '@libs/actions/Link';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

function BaseConfirmNavigateExpensifyClassicModal() {
    const [isOpenAppConfirmNavigateExpensifyClassicModalOpen = false] = useOnyx(ONYXKEYS.IS_OPEN_CONFIRM_NAVIGATE_EXPENSIFY_CLASSIC_MODAL_OPEN, {canBeMissing: true});
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});
    const {translate} = useLocalize();

    const handleConfirm = () => {
        setIsOpenConfirmNavigateExpensifyClassicModalOpen(false);
        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeApp({shouldSetNVP: true, isTrackingGPS});
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
