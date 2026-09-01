import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type ConfirmModalWrapper from '@components/Modal/Global/ConfirmModalWrapper';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ModalProps} from '@components/Modal/Global/ModalContext';

import {showPermissionErrorAlert} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import {getSaveablePendingReceiptRequests, saveReceiptsToGallery} from '@libs/savePendingReceiptsToGallery';

import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {stopGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import CONST from '@src/CONST';

import type React from 'react';

import {stopLocationUpdatesAsync} from 'expo-location';

import {signOutAndRedirectToSignIn} from './Session';

type ConfirmModalOptions = Omit<React.ComponentProps<typeof ConfirmModalWrapper>, keyof ModalProps> & {
    id?: string;
};

type ShowConfirmModal = (options: ConfirmModalOptions) => Promise<{action: string}>;

type InteractiveSignOutParams = {
    translate: LocaleContextProps['translate'];
    isOffline: boolean;
    isTrackingGPS: boolean;
    showConfirmModal: ShowConfirmModal;
    /** When true, the user already confirmed sign-out (e.g. from the require-2FA overlay). Skips the fast-path that signs out without prompts. */
    hasConfirmedSignOut?: boolean;
};

/**
 * Interactive sign-out used by Settings and blocking overlays.
 * Saves queued receipts, warns when offline or GPS tracking is active, then clears the session.
 */
async function signOutInteractively({translate, isOffline, isTrackingGPS, showConfirmModal, hasConfirmedSignOut = false}: InteractiveSignOutParams) {
    const saveableReceipts = getSaveablePendingReceiptRequests();
    const shouldWarnBeforeSignOut = isOffline || isTrackingGPS;
    const isOfflineReceiptsCase = isOffline && !isTrackingGPS && saveableReceipts.length > 0;

    if (!hasConfirmedSignOut && !shouldWarnBeforeSignOut && saveableReceipts.length === 0) {
        return signOutAndRedirectToSignIn();
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
        if (shouldWarnBeforeSignOut) {
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
}

/**
 * Forced sign-out (expired session, SAML re-auth) must be non-interactive: it must not touch the gallery flow,
 * which can trigger OS permission prompts and delay the redirect.
 */
function signOutImmediately() {
    signOutAndRedirectToSignIn();
}

export {signOutInteractively, signOutImmediately};
export type {InteractiveSignOutParams};
