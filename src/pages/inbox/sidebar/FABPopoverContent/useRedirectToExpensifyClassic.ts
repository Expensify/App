import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useMappedPolicies from '@hooks/useMappedPolicies';
import useOnyx from '@hooks/useOnyx';
import {openOldDotLink} from '@libs/actions/Link';
import {areAllGroupPoliciesExpenseChatDisabled} from '@libs/PolicyUtils';
import {closeReactNativeApp} from '@userActions/HybridApp';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type * as OnyxTypes from '@src/types/onyx';
import {policyMapper} from './types';

function useRedirectToExpensifyClassic() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});
    const [allPolicies] = useMappedPolicies(policyMapper);

    const shouldRedirectToExpensifyClassic = useMemo(() => {
        return areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {});
    }, [allPolicies]);

    const showRedirectToExpensifyClassicModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('sidebarScreen.redirectToExpensifyClassicModal.title'),
            prompt: translate('sidebarScreen.redirectToExpensifyClassicModal.description'),
            confirmText: translate('exitSurvey.goToExpensifyClassic'),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        if (CONFIG.IS_HYBRID_APP) {
            closeReactNativeApp({shouldSetNVP: true, isTrackingGPS});
            return;
        }
        openOldDotLink(CONST.OLDDOT_URLS.INBOX);
    }, [showConfirmModal, translate, isTrackingGPS]);

    return {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, allPolicies};
}

export default useRedirectToExpensifyClassic;
