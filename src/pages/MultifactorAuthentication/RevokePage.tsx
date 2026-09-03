import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/ButtonComposed';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useBiometricRegistrationStatus from '@hooks/useBiometricRegistrationStatus';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';

import {openMultifactorAuthenticationRevokePage} from '@userActions/User';

import CONST from '@src/CONST';

import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';

import RevokeRow from './RevokeRow';

type ConfirmMode = 'thisDevice' | 'single' | 'multiple' | 'all';

const confirmPromptKeys = {
    thisDevice: 'multifactorAuthentication.revoke.confirmationPromptThisDevice',
    single: 'multifactorAuthentication.revoke.confirmationPrompt',
    multiple: 'multifactorAuthentication.revoke.confirmationPromptMultiple',
    all: 'multifactorAuthentication.revoke.confirmationPromptAll',
} as const;

/**
 * Revoke page for multifactor authentication (biometric/passkey) credentials.
 *
 * Bottom button behavior and text:
 * - No devices registered → text: "Done"           behavior: navigates back
 * - Exactly one device    → text: "Revoke access"  behavior: revokes all credentials
 * - Multiple devices      → text: "Revoke all"     behavior: revokes all credentials
 *
 * Confirmation modal text and button varies by context...
 *
 * When an inline `Revoke` button is pressed, the confirmation text/button show:
 * - "This device"                                          → text: "...verification on this device"    button: "Revoke access"
 * - "Other devices" (1 other device)                       → text: "...verification on that device"    button: "Revoke access"
 * - "Other devices" (2+ others this device registered)     → text: "...verification on those devices"  button: "Revoke access"
 * - "Other devices" (2+ others this device not registered) → text: "...verification on any device"     button: "Revoke all"
 *
 * When the bottom button pressed, the confirmation text/button show:
 * - Only this device registered                   → text: "...verification on this device"  button: "Revoke access"
 * - 1 other device, this device not registered    → text: "...verification on that device"  button: "Revoke access"
 * - 2+ others, this device not registered         → text: "...verification on any device"   button: "Revoke all"
 * - 2+ others, this device registered             → text: "...verification on any device"   button: "Revoke all"
 */
function MultifactorAuthenticationRevokePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal, closeModal} = useConfirmModal();
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [isThisDeviceLoading, setIsThisDeviceLoading] = useState(false);
    const [isOtherDevicesLoading, setIsOtherDevicesLoading] = useState(false);

    const {localCredentialID, isCurrentDeviceRegistered, otherDeviceCount, totalDeviceCount} = useBiometricRegistrationStatus();
    const hasDevices = totalDeviceCount > 0;
    const hasMultipleKeys = totalDeviceCount > 1;

    useEffect(() => {
        openMultifactorAuthenticationRevokePage();
    }, []);

    const onGoBackPress = () => {
        Navigation.goBack();
    };

    const executeRevoke = useCallback(
        async (params: Parameters<typeof revokeMultifactorAuthenticationCredentials>[0], setLoading: (loading: boolean) => void) => {
            setLoading(true);
            setErrorMessage(undefined);
            const result = await revokeMultifactorAuthenticationCredentials(params);
            setLoading(false);
            if (result.httpStatusCode !== 200) {
                setErrorMessage(translate('multifactorAuthentication.revoke.error'));
            }
        },
        [translate],
    );

    // Since localCredentialID is loaded asynchronously, it can become undefined between the render that shows
    // the button and the moment the user taps it. If these callbacks closed over localCredentialID directly, a
    // stale undefined value could cause revokeThisDevice to silently no-op, or revokeOtherDevices to send
    // empty params and accidentally revoke ALL credentials. The call sites pass localCredentialID at render time
    // so the closure captures the value that was known-good when the button was displayed.
    const revokeThisDevice = useCallback(
        async (keyID: string) => {
            await executeRevoke({onlyKeyID: keyID}, setIsThisDeviceLoading);
        },
        [executeRevoke],
    );

    const revokeOtherDevices = useCallback(
        async (currentDeviceKeyID: string) => {
            const params = {exceptKeyID: currentDeviceKeyID};
            await executeRevoke(params, setIsOtherDevicesLoading);
        },
        [executeRevoke],
    );

    const revokeAll = useCallback(async () => {
        const setLoading = (loading: boolean) => {
            setIsThisDeviceLoading(loading);
            setIsOtherDevicesLoading(loading);
        };
        await executeRevoke({}, setLoading);
    }, [executeRevoke]);

    // The modal is passed isConfirmLoading, so the global modal system keeps it open in a loading state after the promise resolves.
    // Every path below has to call closeModal() to actually dismiss it.
    const handleRevokeConfirm = async (mode: ConfirmMode) => {
        if (mode === 'thisDevice') {
            if (!localCredentialID) {
                closeModal();
                return;
            }
            await revokeThisDevice(localCredentialID);
        } else if (mode === 'multiple') {
            if (!localCredentialID) {
                closeModal();
                return;
            }
            await revokeOtherDevices(localCredentialID);
        } else if (mode === 'single') {
            if (!localCredentialID) {
                await revokeAll();
            } else {
                await revokeOtherDevices(localCredentialID);
            }
        } else if (mode === 'all') {
            await revokeAll();
        }
        closeModal();
    };

    const promptRevoke = (mode: ConfirmMode) => {
        const ctaKey = mode === 'all' ? 'multifactorAuthentication.revoke.ctaAll' : 'multifactorAuthentication.revoke.cta';

        showConfirmModal({
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            title: translate(ctaKey),
            prompt: translate(confirmPromptKeys[mode]),
            confirmText: translate(ctaKey),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            // Defined (not just truthy) so the wrapper takes its async branch and shows the loading state while the revoke request is in flight.
            isConfirmLoading: false,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            handleRevokeConfirm(mode);
        });
    };

    const otherDevicesConfirmMode = (): ConfirmMode => {
        if (otherDeviceCount === 1) {
            return 'single';
        }

        // Revoking multiple "other devices" when the current device is not registered
        // is equivalent to revoking all devices, so the modal should say "Revoke all".
        if (!isCurrentDeviceRegistered) {
            return 'all';
        }
        return 'multiple';
    };

    const revokeAllConfirmMode = (): ConfirmMode => {
        if (!hasMultipleKeys) {
            return isCurrentDeviceRegistered ? 'thisDevice' : 'single';
        }
        return 'all';
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationRevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.revoke.title')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <Text style={[styles.m5, styles.mt3, styles.textNormal]}>
                        {translate(hasDevices ? 'multifactorAuthentication.revoke.explanation' : 'multifactorAuthentication.revoke.noDevices')}
                    </Text>
                    {hasDevices && (
                        <View>
                            {/* The isCurrentDeviceRegistered guard guarantees localCredentialID is
                               truthy here. Do not remove this guard without updating the non-null assertion on localCredentialID below. */}
                            {isCurrentDeviceRegistered && (
                                <RevokeRow
                                    title={translate('multifactorAuthentication.revoke.thisDevice')}
                                    isLoading={isThisDeviceLoading}
                                    onPress={() => {
                                        if (!localCredentialID) {
                                            return;
                                        }
                                        promptRevoke('thisDevice');
                                    }}
                                />
                            )}
                            {otherDeviceCount > 0 && (
                                <RevokeRow
                                    title={translate('multifactorAuthentication.revoke.otherDevices', {count: otherDeviceCount})}
                                    isLoading={isOtherDevicesLoading}
                                    onPress={() => {
                                        promptRevoke(otherDevicesConfirmMode());
                                    }}
                                />
                            )}
                        </View>
                    )}
                </ScrollView>
                {!!errorMessage && (
                    <FormHelpMessage
                        message={errorMessage}
                        style={[styles.mh5, styles.mb3]}
                    />
                )}
                <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                    {hasDevices ? (
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.DANGER}
                            style={styles.flex1}
                            isLoading={isThisDeviceLoading && isOtherDevicesLoading}
                            onPress={() => promptRevoke(revokeAllConfirmMode())}
                        >
                            <Button.Text>{translate(hasMultipleKeys ? 'multifactorAuthentication.revoke.ctaAll' : 'multifactorAuthentication.revoke.cta')}</Button.Text>
                        </Button>
                    ) : (
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            style={styles.flex1}
                            onPress={onGoBackPress}
                        >
                            <Button.Text>{translate('multifactorAuthentication.revoke.dismiss')}</Button.Text>
                        </Button>
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationRevokePage.displayName = 'MultifactorAuthenticationRevokePage';

export default MultifactorAuthenticationRevokePage;
