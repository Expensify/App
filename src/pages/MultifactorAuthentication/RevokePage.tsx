import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {revokeMultifactorAuthenticationCredentials} from '@libs/actions/MultifactorAuthentication';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

function getHasDevices(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs?.length > 0;
}

function getIsLoading(data: OnyxEntry<Account>) {
    return !!data?.isLoading;
}
function MultifactorAuthenticationRevokePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();

    const [hasDevices] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getHasDevices, canBeMissing: true});
    const [isLoading] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getIsLoading, canBeMissing: true});

    const onGoBackPress = () => {
        Navigation.goBack();
    };

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const handleRevokeConfirm = async () => {
        const result = await revokeMultifactorAuthenticationCredentials();

        if (result.httpCode === 200) {
            hideConfirmModal();
            Navigation.goBack();
        } else {
            hideConfirmModal();
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
                            danger
                            style={styles.flex1}
                            onPress={showConfirmModal}
                            text={translate('multifactorAuthentication.revoke.cta')}
                        />
                    ) : (
                        <Button
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
                title={translate('multifactorAuthentication.revoke.cta')}
                prompt={translate('multifactorAuthentication.revoke.confirmationPrompt')}
                confirmText={translate('multifactorAuthentication.revoke.cta')}
                cancelText={translate('common.cancel')}
                isVisible={isConfirmModalVisible}
                onConfirm={() => {
                    handleRevokeConfirm();
                }}
                onCancel={hideConfirmModal}
                shouldShowCancelButton
                isConfirmLoading={isLoading}
            />
        </ScreenWrapper>
    );
}

MultifactorAuthenticationRevokePage.displayName = 'MultifactorAuthenticationRevokePage';

export default MultifactorAuthenticationRevokePage;
