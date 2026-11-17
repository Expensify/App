import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';

import {connect, disconnect} from '@libs/actions/Delegate';
import {close as modalClose} from '@libs/actions/Modal';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';

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

        const gpsDraftDetails = await Onyx.get(ONYXKEYS.GPS_DRAFT_DETAILS);
        await stopGpsTrip(false, getGpsPoints(gpsDraftDetails), true);
        switchAccount();
    };

    const switchToDelegator = async (email: string, routeAfterSwitch?: Route) => {
        if (isOffline) {
            modalClose(() => showOfflineModal());
            return;
        }
        // Register before the first await: once the press handler returns, React hides the menu and unregisters it,
        // so a later modalClose would open the next modal over the closing menu, which freezes iOS.
        const menuClosed = new Promise<void>((resolve) => {
            modalClose(resolve);
        });
        const [account, credentials, stashedCredentials, session, stashedSession, activePolicyID, gpsDraftDetails] = await Onyx.multiGet([
            ONYXKEYS.ACCOUNT,
            ONYXKEYS.CREDENTIALS,
            ONYXKEYS.STASHED_CREDENTIALS,
            ONYXKEYS.SESSION,
            ONYXKEYS.STASHED_SESSION,
            ONYXKEYS.NVP_ACTIVE_POLICY_ID,
            ONYXKEYS.GPS_DRAFT_DETAILS,
        ]);
        const delegatedAccess = account?.delegatedAccess;
        const isReturningToOriginalUser = isActingAsDelegate && email === stashedSession?.email;
        // Chained delegation isn't supported by the backend: if we're already acting as a delegate,
        // the only legal switch is back to the original user. Anything else triggers the "Not so fast" modal.
        if (isActingAsDelegate && !isReturningToOriginalUser) {
            await menuClosed;
            showDelegateNoAccessModal();
            return;
        }
        const switchAccount = isReturningToOriginalUser
            ? () => disconnect({stashedCredentials: stashedCredentials ?? CONST.EMPTY_OBJECT, stashedSession})
            : () => connect({email, delegatedAccess, credentials, session, activePolicyID, routeAfterSwitch});
        if (isTrackingSelector(gpsDraftDetails)) {
            await menuClosed;
            showGpsInProgressModal(switchAccount);
            return;
        }
        switchAccount();
    };

    return switchToDelegator;
}

export default useSwitchToDelegator;
