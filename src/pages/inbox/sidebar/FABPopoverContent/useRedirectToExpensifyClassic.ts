import type {OnyxEntry} from 'react-native-onyx';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {openOldDotLink} from '@libs/actions/Link';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {closeReactNativeApp} from '@userActions/HybridApp';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import {shouldRedirectToExpensifyClassicSelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type PolicySelector = Pick<OnyxTypes.Policy, 'type' | 'role' | 'isPolicyExpenseChatEnabled' | 'pendingAction' | 'avatarURL' | 'name' | 'id' | 'areInvoicesEnabled'>;

const policyMapper = (policy: OnyxEntry<OnyxTypes.Policy>): PolicySelector =>
    (policy && {
        type: policy.type,
        role: policy.role,
        id: policy.id,
        isPolicyExpenseChatEnabled: policy.isPolicyExpenseChatEnabled,
        pendingAction: policy.pendingAction,
        avatarURL: policy.avatarURL,
        name: policy.name,
        areInvoicesEnabled: policy.areInvoicesEnabled,
    }) as PolicySelector;

function useRedirectToExpensifyClassic() {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    /**
     * There are scenarios where users who have not yet had their group workspace-chats in NewDot (isPolicyExpenseChatEnabled). In those scenarios, things can get confusing if they try to submit/track expenses. To address this, we block them from Creating, Tracking, Submitting expenses from NewDot if they are:
     * 1. on at least one group policy
     * 2. none of the group policies they are a member of have isPolicyExpenseChatEnabled=true
     */
    const [shouldRedirectToExpensifyClassic = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: shouldRedirectToExpensifyClassicSelector});
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);
    const canRedirectToExpensifyClassic = shouldRedirectToExpensifyClassic && !shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP);
    const canUseAction = !shouldRedirectToExpensifyClassic || canRedirectToExpensifyClassic;

    const showRedirectToExpensifyClassicModal = async () => {
        if (!canRedirectToExpensifyClassic) {
            return;
        }

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
    };

    return {shouldRedirectToExpensifyClassic, canRedirectToExpensifyClassic, canUseAction, showRedirectToExpensifyClassicModal};
}

export type {PolicySelector};
export {policyMapper};
export default useRedirectToExpensifyClassic;
