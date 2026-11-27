/**
 * Shows the confirmation for signing out on all devices, shared by Device management and a domain member's details.
 * The confirmation stays open with an error when the sign-out fails, so the user can retry or cancel.
 */
import CONST from '@src/CONST';

import {useRef} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useNetwork from './useNetwork';

type SignOutAllDevicesConfirmationOptions = {
    /** Explains who will be signed out */
    prompt: string;

    /** Shown in the confirmation when `signOut` resolves to false */
    errorMessage: string;

    /** Resolves to whether the sign-out succeeded */
    signOut: () => Promise<boolean>;
};

function useSignOutAllDevicesConfirmation() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {showConfirmModal} = useConfirmModal();

    // A fast double press would otherwise stack two confirmations for the same destructive action.
    const isConfirmationOpenRef = useRef(false);

    const confirmSignOutAllDevices = ({prompt, errorMessage, signOut}: SignOutAllDevicesConfirmationOptions) => {
        if (isConfirmationOpenRef.current) {
            return;
        }
        isConfirmationOpenRef.current = true;
        const confirmation = isOffline
            ? showConfirmModal({
                  title: translate('common.youAppearToBeOffline'),
                  prompt: translate('common.offlinePrompt'),
                  confirmText: translate('common.buttonConfirm'),
                  shouldShowCancelButton: false,
              })
            : showConfirmModal({
                  title: translate('deviceManagementPage.signOutAllDevices'),
                  prompt,
                  confirmText: translate('deviceManagementPage.signOutAllDevices'),
                  cancelText: translate('common.cancel'),
                  buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                  shouldDisableConfirmButtonWhenOffline: true,
                  onConfirm: async () => {
                      const didSignOut = await signOut();
                      if (!didSignOut) {
                          return errorMessage;
                      }
                  },
              });
        confirmation.finally(() => {
            isConfirmationOpenRef.current = false;
        });
    };

    return confirmSignOutAllDevices;
}

export default useSignOutAllDevicesConfirmation;
