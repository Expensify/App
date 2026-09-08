import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import {connect, disconnect} from '@libs/actions/Delegate';
import {close as modalClose} from '@libs/actions/Modal';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';

import Onyx from 'react-native-onyx';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';

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

    const showOfflineModal = () => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const showGpsInProgressModal = async (gpsPoints: GPSPoint[][], switchAccount: () => ReturnType<typeof connect | typeof disconnect>) => {
        const result = await showConfirmModal({
            title: translate('gps.switchAccountWarningTripInProgress.title'),
            prompt: translate('gps.switchAccountWarningTripInProgress.prompt'),
            confirmText: translate('gps.switchAccountWarningTripInProgress.confirm'),
            cancelText: translate('common.cancel'),
        });

        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        await stopGpsTrip(false, gpsPoints, true);
        switchAccount();
    };

    const switchToDelegator = async (email: string) => {
        if (isOffline) {
            modalClose(() => showOfflineModal());
            return;
        }

        const [account, credentials, stashedCredentials, session, stashedSession, activePolicyID, gpsDraftDetails] = await Promise.all([
            Onyx.get(ONYXKEYS.ACCOUNT),
            Onyx.get(ONYXKEYS.CREDENTIALS),
            Onyx.get(ONYXKEYS.STASHED_CREDENTIALS),
            Onyx.get(ONYXKEYS.SESSION),
            Onyx.get(ONYXKEYS.STASHED_SESSION),
            Onyx.get(ONYXKEYS.NVP_ACTIVE_POLICY_ID),
            Onyx.get(ONYXKEYS.GPS_DRAFT_DETAILS),
        ]);
        const delegatedAccess = account?.delegatedAccess;

        const isReturningToOriginalUser = isActingAsDelegate && email === stashedSession?.email;
        // Chained delegation isn't supported by the backend — if we're already acting as a delegate,
        // the only legal switch is back to the original user. Anything else triggers the "Not so fast" modal.
        if (isActingAsDelegate && !isReturningToOriginalUser) {
            modalClose(() => showDelegateNoAccessModal());
            return;
        }
        const switchAction = isReturningToOriginalUser
            ? () => disconnect({stashedCredentials: stashedCredentials ?? CONST.EMPTY_OBJECT, stashedSession})
            : () => connect({email, delegatedAccess, credentials, session, activePolicyID});
        if (isTrackingSelector(gpsDraftDetails)) {
            modalClose(() => showGpsInProgressModal(getGpsPoints(gpsDraftDetails), switchAction));
            return;
        }
        switchAction();
    };

    return switchToDelegator;
}

export default useSwitchToDelegator;
