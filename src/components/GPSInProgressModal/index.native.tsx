import ConfirmModal from '@components/ConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {setIsGPSInProgressModalOpen} from '@libs/actions/isGPSInProgressModalOpen';
import {stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function GPSInProgressModal() {
    const [isGPSInProgressModalOpen] = useOnyx(ONYXKEYS.IS_GPS_IN_PROGRESS_MODAL_OPEN, {canBeMissing: true});
    const {translate} = useLocalize();

    const stopGpsAndSwitchToOD = async () => {
        setIsGPSInProgressModalOpen(false);
        await stopGpsTrip();
        closeReactNativeApp({shouldSetNVP: true, isTrackingGPS: false});
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
