import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {setIsGPSInProgressModalOpen} from '@libs/actions/isGPSInProgressModalOpen';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function GPSInProgressModal() {
    const [isGPSInProgressModalOpen] = useOnyx(ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const stopGpsAndSwitchToOD = async () => {
        setIsGPSInProgressModalOpen(false);
        await stopGpsTrip(isOffline, getGpsPoints(gpsDraftDetails));
        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false, shouldIgnoreTryNewDotLoading: true});
    };

    return (
        <ConfirmModal
            title={translate('gps.switchToODWarningTripInProgress.title')}
            isVisible={!!isGPSInProgressModalOpen}
            onCancel={() => setIsGPSInProgressModalOpen(false)}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onConfirm={stopGpsAndSwitchToOD}
            confirmText={translate('gps.switchToODWarningTripInProgress.confirm')}
            cancelText={translate('common.cancel')}
            prompt={translate('gps.switchToODWarningTripInProgress.prompt')}
            danger
        />
    );
}

GPSInProgressModal.displayName = 'GPSInProgressModal';

export default GPSInProgressModal;
