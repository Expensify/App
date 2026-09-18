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

import {stopLocationUpdatesAsync} from 'expo-location';
import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

type SignOutOptions = {
    /** When true, the user already confirmed generic sign-out (e.g. from the require-2FA overlay). Skips the fast-path and duplicate generic offline prompts; GPS and receipt prompts still run. */
    hasConfirmedSignOut?: boolean;
};

type LeaveDelegateAccountOptions = {
    /** When true, the user already confirmed leaving the delegated account (e.g. from the require-2FA overlay). Skips the duplicate generic leave prompt; offline and GPS prompts still run. */
    hasConfirmedLeave?: boolean;
};

function useSignOut() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {
        selector: isTrackingSelector,
    });
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [isActingAsDelegate = false] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isActingAsDelegateSelector,
    });
    const [stashedCredentials = CONST.EMPTY_OBJECT] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);

    const showOfflineModal = useCallback(() => {
        showConfirmModal({
            title: translate('common.youAppearToBeOffline'),
            prompt: translate('common.offlinePrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    }, [showConfirmModal, translate]);

    const signOutImmediately = useCallback(() => {
        signOutAndRedirectToSignIn();
    }, []);

    const signOut = useCallback(
        async ({hasConfirmedSignOut = false}: SignOutOptions = {}) => {
            const saveableReceipts = getSaveablePendingReceiptRequests();
            const shouldWarnBeforeSignOut = isOffline || isTrackingGPS;
            const isOfflineReceiptsCase = isOffline && !isTrackingGPS && saveableReceipts.length > 0;

            if (!hasConfirmedSignOut && !shouldWarnBeforeSignOut && saveableReceipts.length === 0) {
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
                const shouldShowOfflineOrGpsWarning = shouldWarnBeforeSignOut && (!hasConfirmedSignOut || isTrackingGPS);
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
        },
        [isOffline, isTrackingGPS, showConfirmModal, translate],
    );

    const leaveDelegateAccount = useCallback(
        async ({hasConfirmedLeave = false}: LeaveDelegateAccountOptions = {}) => {
            if (isOffline) {
                showOfflineModal();
                return;
            }

            if (!hasConfirmedLeave) {
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
            }

            const leaveAction = () => disconnect({stashedCredentials, stashedSession});

            if (isTrackingGPS) {
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
            }

            leaveAction();
        },
        [gpsDraftDetails, isOffline, isTrackingGPS, showConfirmModal, showOfflineModal, stashedCredentials, stashedSession, translate],
    );

    return {
        signOut,
        signOutImmediately,
        leaveDelegateAccount,
        isActingAsDelegate,
    };
}

export default useSignOut;
