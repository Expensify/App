import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import {connect, disconnect} from '@libs/actions/Delegate';
import {close as modalClose} from '@libs/actions/Modal';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {Account} from '@src/types/onyx';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

/**
 * Encapsulates the safety checks needed before switching to a delegator account:
 * 1. Offline check – blocks the switch and shows an offline modal.
 * 2. Chained delegation check – if already acting as a delegate and not returning
 *    to the original user, shows the "not so fast" modal.
 * 3. GPS tracking check – if a GPS trip is in progress, asks the user to confirm
 *    stopping the trip before switching.
 */
function useSwitchToDelegator() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const [delegatedAccess] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account: Account | undefined) => account?.delegatedAccess});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});

    const showOfflineModal = () => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const showGpsInProgressModal = async (switchAccount: () => ReturnType<typeof connect | typeof disconnect>) => {
        const result = await showConfirmModal({
            title: translate('gps.switchAccountWarningTripInProgress.title'),
            prompt: translate('gps.switchAccountWarningTripInProgress.prompt'),
            confirmText: translate('gps.switchAccountWarningTripInProgress.confirm'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        await stopGpsTrip(false, getGpsPoints(gpsDraftDetails), true);
        switchAccount();
    };

    const switchToDelegator = (email: string) => {
        if (isOffline) {
            modalClose(() => showOfflineModal());
            return;
        }
        const isReturningToOriginalUser = isActingAsDelegate && email === stashedSession?.email;
        // Chained delegation isn't supported by the backend — if we're already acting as a delegate,
        // the only legal switch is back to the original user. Anything else triggers the "Not so fast" modal.
        if (isActingAsDelegate && !isReturningToOriginalUser) {
            modalClose(() => showDelegateNoAccessModal());
            return;
        }
        const switchAction = isReturningToOriginalUser
            ? () => disconnect({stashedCredentials, stashedSession})
            : () => connect({email, delegatedAccess, credentials, session, activePolicyID});
        if (isTrackingGPS) {
            modalClose(() => showGpsInProgressModal(switchAction));
            return;
        }
        switchAction();
    };

    return switchToDelegator;
}

export default useSwitchToDelegator;
