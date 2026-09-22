import {ModalActions} from '@components/Modal/Global/ModalContext';

import {disconnect} from '@libs/actions/Delegate';
import {showPermissionErrorAlert} from '@libs/fileDownload/FileUtils';
import {getGpsPoints, stopGpsTrip} from '@libs/GPSDraftDetailsUtils';
import Log from '@libs/Log';
import {getSaveablePendingReceiptRequests, saveReceiptsToGallery} from '@libs/savePendingReceiptsToGallery';

import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {stopGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import {signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';

import {stopLocationUpdatesAsync} from 'expo-location';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type SignOutOptions = {
    /** When true, always show the generic sign-out confirm (e.g. from the require-2FA overlay). GPS and receipt prompts still run when applicable. */
    shouldAlwaysConfirm?: boolean;
};

type LeaveDelegateAccountOptions = {
    /** GPS draft details from a ref synced by GpsDraftDetailsRefSync; required when leaving during an active trip. */
    gpsDraftDetails?: GpsDraftDetails;
};

function useSignOut() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {
        selector: isTrackingSelector,
    });
    const [isActingAsDelegate = false] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isActingAsDelegateSelector,
    });
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);

    const showOfflineModal = () => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    const signOutImmediately = () => {
        signOutAndRedirectToSignIn();
    };

    const signOut = async ({shouldAlwaysConfirm = false}: SignOutOptions = {}) => {
        const saveableReceipts = getSaveablePendingReceiptRequests();
        const shouldWarnBeforeSignOut = isOffline || isTrackingGPS;
        const isOfflineReceiptsCase = isOffline && !isTrackingGPS && saveableReceipts.length > 0;

        if (!shouldAlwaysConfirm && !shouldWarnBeforeSignOut && saveableReceipts.length === 0) {
            signOutAndRedirectToSignIn();
            return;
        }

        const confirmModalTitle = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.title') : translate('common.areYouSure');
        const confirmModalPrompt = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.prompt') : translate('initialSettingsPage.signOutConfirmationText');
        const confirmModalConfirmText = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.confirm') : translate('initialSettingsPage.signOut');

        const saveReceipts = async () => {
            try {
                const {savedCount, failedCount, permissionDenied} = await saveReceiptsToGallery(saveableReceipts);
                Log.info('[Receipt] Saved pending receipts to gallery before sign-out', false, {savedCount, failedCount, permissionDenied});
                if (permissionDenied) {
                    showPermissionErrorAlert(translate);
                }
            } catch (error) {
                Log.alert('[Receipt] Unexpected rejection from saveReceiptsToGallery; sign-out continued', {error});
            }
        };

        if (isOfflineReceiptsCase) {
            const result = await showConfirmModal({
                title: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.title'),
                prompt: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.prompt', {
                    count: saveableReceipts.length,
                }),
                confirmText: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            });
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            await saveReceipts();
        } else {
            const shouldShowOfflineOrGpsWarning = shouldWarnBeforeSignOut || shouldAlwaysConfirm;
            if (shouldShowOfflineOrGpsWarning) {
                const result = await showConfirmModal({
                    title: confirmModalTitle,
                    prompt: confirmModalPrompt,
                    confirmText: confirmModalConfirmText,
                    cancelText: translate('common.cancel'),
                    shouldShowCancelButton: true,
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                });
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
            }

            if (saveableReceipts.length > 0) {
                const result = await showConfirmModal({
                    title: translate('initialSettingsPage.saveReceiptsConfirmation.title'),
                    prompt: translate('initialSettingsPage.saveReceiptsConfirmation.prompt', {
                        count: saveableReceipts.length,
                    }),
                    confirmText: translate('initialSettingsPage.saveReceiptsConfirmation.confirm'),
                    cancelText: translate('common.cancel'),
                    shouldShowCancelButton: true,
                });
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                await saveReceipts();
            }
        }

        if (isTrackingGPS) {
            stopGpsTripNotification();
            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
        }

        signOutAndRedirectToSignIn();
    };

    const leaveDelegateAccount = async ({gpsDraftDetails}: LeaveDelegateAccountOptions = {}) => {
        if (isOffline) {
            showOfflineModal();
            return;
        }

        const result = await showConfirmModal({
            title: translate('common.areYouSure'),
            prompt: translate('delegate.leaveAccountConfirmationText'),
            confirmText: translate('delegate.leaveAccount'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }

        const leaveAction = () => disconnect({stashedCredentials, stashedSession});

        if (isTrackingGPS) {
            const gpsResult = await showConfirmModal({
                title: translate('gps.switchAccountWarningTripInProgress.title'),
                prompt: translate('gps.switchAccountWarningTripInProgress.prompt'),
                confirmText: translate('gps.switchAccountWarningTripInProgress.confirm'),
                cancelText: translate('common.cancel'),
            });
            if (gpsResult.action !== ModalActions.CONFIRM) {
                return;
            }
            await stopGpsTrip(false, getGpsPoints(gpsDraftDetails), true);
        }

        leaveAction();
    };

    return {
        signOut,
        signOutImmediately,
        leaveDelegateAccount,
        isActingAsDelegate,
        isTrackingGPS,
    };
}

export default useSignOut;
