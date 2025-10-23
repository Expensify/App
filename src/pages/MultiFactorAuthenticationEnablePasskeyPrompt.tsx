import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Text from '@components/Text';
import Button from '@components/Button';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';

function multiFactorAuthenticationEnablePasskeyPrompt() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const onConfirm = () => {
        onGoBackPress();
    };
    return (
        <ScreenWrapper testID={multiFactorAuthenticationEnablePasskeyPrompt.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <BlockingView
                        icon={Illustrations.Encryption}
                        contentFitImage="fill"
                        title={translate("multiFactorAuthentication.prompts.enablePasskeyPromptTitle")}
                        subtitle={translate("multiFactorAuthentication.prompts.enablePasskeyPromptContent")}
                        subtitleStyle={styles.textSupporting}
                        containerStyle={styles.p0}
                        testID={multiFactorAuthenticationEnablePasskeyPrompt.displayName}
                    />
                </View>
                <View style={[styles.flexColumn, styles.gap3, styles.m5]}>
                    <Button
                        style={[styles.flex1]}
                        onPress={onGoBackPress}
                        text={translate('common.notNow')}
                    />
                    <Button
                        success
                        style={[styles.flex1]}
                        onPress={onGoBackPress}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

multiFactorAuthenticationEnablePasskeyPrompt.displayName = 'MultiFactorAuthenticationEnableBiometricsPrompt';

export default multiFactorAuthenticationEnablePasskeyPrompt;