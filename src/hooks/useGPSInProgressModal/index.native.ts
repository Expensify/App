import {ModalActions} from '@components/Modal/Global/ModalContext';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {setIsGPSInProgressModalOpen} from '@libs/actions/isGPSInProgressModalOpen';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

/**
 * Pushes the "a trip is in progress" prompt onto the global modal stack.
 *
 * The prompt is asked for by `closeReactNativeApp`, a non-React action that cannot call a hook, so the Onyx flag stays
 * as the cross-boundary trigger and this hook is the controller that turns it into a modal. Nothing other than
 * the answer below clears the flag, so the entry never has to be taken down by hand.
 */
function useGPSInProgressModal() {
    const [isGPSInProgressModalOpen] = useOnyx(ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();

    // Keeps a re-render from stacking a second prompt on top of the one that is already open.
    const isPromptShownRef = useRef(false);

    // The trip keeps recording points while the prompt is open, so what gets submitted has to be read when the user
    // answers rather than when the prompt is shown. Reading the render-time values inside the handler below would
    // submit the trip as it stood at show time, which is a truncated trip.
    const gpsDraftDetailsRef = useRef(gpsDraftDetails);
    const isOfflineRef = useRef(isOffline);

    useEffect(() => {
        gpsDraftDetailsRef.current = gpsDraftDetails;
        isOfflineRef.current = isOffline;

        if (!isGPSInProgressModalOpen || isPromptShownRef.current) {
            return;
        }
        isPromptShownRef.current = true;

        showConfirmModal({
            title: translate('gps.switchToODWarningTripInProgress.title'),
            prompt: translate('gps.switchToODWarningTripInProgress.prompt'),
            confirmText: translate('gps.switchToODWarningTripInProgress.confirm'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        }).then(async (result) => {
            isPromptShownRef.current = false;
            setIsGPSInProgressModalOpen(false);

            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            await stopGpsTrip(isOfflineRef.current, getGpsPoints(gpsDraftDetailsRef.current));
            closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false, shouldIgnoreTryNewDotLoading: true});
        });
    }, [gpsDraftDetails, isGPSInProgressModalOpen, isOffline, showConfirmModal, translate]);
}

export default useGPSInProgressModal;
