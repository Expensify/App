import {ModalActions} from '@components/Modal/Global/ModalContext';
// eslint-disable-next-line no-restricted-imports
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

function useCloseReactNativeApp() {
    const {showConfirmModal} = useConfirmModal();
    const {translate} = useLocalize();

    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {canBeMissing: true, selector: isTrackingSelector});

    async function closeReactNativeAppWithGPSCheck(params: Parameters<typeof closeReactNativeApp>[0]) {
        if (isTrackingGPS) {
            const result = await showConfirmModal({
                title: translate('gps.switchToODWarningTripInProgress.title'),
                prompt: translate('gps.switchToODWarningTripInProgress.prompt'),
                confirmText: translate('gps.switchToODWarningTripInProgress.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
                danger: true,
            });

            if (result.action === ModalActions.CLOSE) {
                return;
            }

            await stopGpsTrip();
        }

        closeReactNativeApp(params);
    }

    return {closeReactNativeAppWithGPSCheck};
}

export default useCloseReactNativeApp;
