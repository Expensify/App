import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useBiometricRegistrationStatus from '@hooks/useBiometricRegistrationStatus';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import {openMultifactorAuthenticationRevokePage} from '@userActions/User';

function MultifactorAuthenticationRevokePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | undefined>();
    const [isRevokeAll, setIsRevokeAll] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [isThisDeviceLoading, setIsThisDeviceLoading] = useState(false);
    const [isOtherDevicesLoading, setIsOtherDevicesLoading] = useState(false);

    const {localPublicKey, isCurrentDeviceRegistered, otherDeviceCount, totalDeviceCount} = useBiometricRegistrationStatus();
    const hasDevices = totalDeviceCount > 0;
    const hasMultipleKeys = totalDeviceCount > 1;

    useEffect(() => {
        openMultifactorAuthenticationRevokePage();
    }, []);

    const onGoBackPress = () => {
        Navigation.goBack();
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const showRevokeConfirm = (revokeAction: () => Promise<void>, isAll: boolean) => {
        setConfirmAction(() => revokeAction);
        setIsRevokeAll(isAll);
        setConfirmModalVisibility(true);
    };

    const handleRevokeConfirm = async () => {
        if (confirmAction) {
            await confirmAction();
        }
        hideConfirmModal();
    };

    const revokeThisDevice = async () => {
        if (!localPublicKey) {
            return;
        }
        setIsThisDeviceLoading(true);
        const result = await revokeMultifactorAuthenticationCredentials({onlyKeyID: localPublicKey});
        setIsThisDeviceLoading(false);
        if (result.httpStatusCode !== 200) {
            setErrorMessage(translate('multifactorAuthentication.revoke.error'));
        }
    };

    const revokeOtherDevices = async () => {
        setIsOtherDevicesLoading(true);
        const params = isCurrentDeviceRegistered && localPublicKey ? {exceptKeyID: localPublicKey} : {};
        const result = await revokeMultifactorAuthenticationCredentials(params);
        setIsOtherDevicesLoading(false);
        if (result.httpStatusCode !== 200) {
            setErrorMessage(translate('multifactorAuthentication.revoke.error'));
        }
    };

    const revokeAll = async () => {
        setIsThisDeviceLoading(true);
        setIsOtherDevicesLoading(true);
        const result = await revokeMultifactorAuthenticationCredentials();
        setIsThisDeviceLoading(false);
        setIsOtherDevicesLoading(false);
        if (result.httpStatusCode !== 200) {
            setErrorMessage(translate('multifactorAuthentication.revoke.error'));
        }
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationRevokePage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.revoke.title')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <Text style={[styles.m5, styles.mt3, styles.textNormal]}>
                        {translate(hasDevices ? 'multifactorAuthentication.revoke.explanation' : 'multifactorAuthentication.revoke.noDevices')}
                    </Text>
                    {hasDevices && (
                        <View>
                            {isCurrentDeviceRegistered && (
                                <MenuItem
                                    title={translate('multifactorAuthentication.revoke.thisDevice')}
                                    interactive={false}
                                    shouldShowRightComponent
                                    rightComponent={
                                        <View style={styles.justifyContentCenter}>
                                            <Button
                                                danger
                                                small
                                                isLoading={isThisDeviceLoading}
                                                text={translate('multifactorAuthentication.revoke.revoke')}
                                                onPress={() => showRevokeConfirm(revokeThisDevice, false)}
                                            />
                                        </View>
                                    }
                                />
                            )}
                            {otherDeviceCount > 0 && (
                                <MenuItem
                                    title={translate('multifactorAuthentication.revoke.otherDevices', {count: otherDeviceCount})}
                                    interactive={false}
                                    shouldShowRightComponent
                                    rightComponent={
                                        <View style={styles.justifyContentCenter}>
                                            <Button
                                                danger
                                                small
                                                isLoading={isOtherDevicesLoading}
                                                text={translate('multifactorAuthentication.revoke.revoke')}
                                                onPress={() => showRevokeConfirm(revokeOtherDevices, false)}
                                            />
                                        </View>
                                    }
                                />
                            )}
                        </View>
                    )}
                </View>
                {!!errorMessage && (
                    <FormHelpMessage
                        message={errorMessage}
                        style={[styles.mh5, styles.mb3]}
                    />
                )}
                <View style={[styles.flexRow, styles.m5, styles.mt0]}>
                    {hasDevices ? (
                        <Button
                            large
                            danger
                            style={styles.flex1}
                            isLoading={isThisDeviceLoading && isOtherDevicesLoading}
                            onPress={() => showRevokeConfirm(revokeAll, hasMultipleKeys)}
                            text={translate(hasMultipleKeys ? 'multifactorAuthentication.revoke.ctaAll' : 'multifactorAuthentication.revoke.cta')}
                        />
                    ) : (
                        <Button
                            large
                            success
                            style={styles.flex1}
                            onPress={onGoBackPress}
                            text={translate('multifactorAuthentication.revoke.dismiss')}
                        />
                    )}
                </View>
            </FullPageOfflineBlockingView>
            <ConfirmModal
                danger
                title={translate(isRevokeAll ? 'multifactorAuthentication.revoke.ctaAll' : 'multifactorAuthentication.revoke.cta')}
                prompt={translate(isRevokeAll ? 'multifactorAuthentication.revoke.confirmationPromptAll' : 'multifactorAuthentication.revoke.confirmationPrompt')}
                confirmText={translate(isRevokeAll ? 'multifactorAuthentication.revoke.ctaAll' : 'multifactorAuthentication.revoke.cta')}
                cancelText={translate('common.cancel')}
                isVisible={isConfirmModalVisible}
                onConfirm={() => {
                    handleRevokeConfirm();
                }}
                onCancel={hideConfirmModal}
                shouldShowCancelButton
            />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationRevokePage.displayName = 'MultifactorAuthenticationRevokePage';

export default MultifactorAuthenticationRevokePage;
