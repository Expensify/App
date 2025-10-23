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
import LottieAnimations from '@components/LottieAnimations';

function multiFactorAuthenticationEnableBiometricsPrompt() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();

    const onConfirm = () => {
        onGoBackPress();
    };
    return (
        <ScreenWrapper testID={multiFactorAuthenticationEnableBiometricsPrompt.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <BlockingView
                        animation={LottieAnimations.Fingerprint}
                        contentFitImage="fill"
                        title={translate("multiFactorAuthentication.prompts.enableBiometricsPromptTitle")}
                        subtitle={translate("multiFactorAuthentication.prompts.enableBiometricsPromptContent")}
                        subtitleStyle={styles.textSupporting}
                        containerStyle={styles.p0}
                        testID={multiFactorAuthenticationEnableBiometricsPrompt.displayName}
                    />
                </View>
                <View style={[styles.flexColumn, styles.gap3, styles.m5]}>
                    <Button
                        onPress={onGoBackPress}
                        text={translate('common.notNow')}
                    />
                    <Button
                        success
                        onPress={onGoBackPress}
                        text={translate('common.buttonConfirm')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

multiFactorAuthenticationEnableBiometricsPrompt.displayName = 'MultiFactorAuthenticationEnableBiometricsPrompt';

export default multiFactorAuthenticationEnableBiometricsPrompt;