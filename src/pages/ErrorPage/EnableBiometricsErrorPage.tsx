import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import Button from '@components/Button';
import variables from '@styles/variables';
import useLocalize from '@hooks/useLocalize';

function EnableBiometricsErrorPage() {
    const {translate} = useLocalize()
    const styles = useThemeStyles();
    
    return (
        <ScreenWrapper
            testID={EnableBiometricsErrorPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.biometrics.biometricsTest')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <BlockingView
                    icon={Illustrations.JustHumptyDumpty}
                    iconWidth={variables.errorPageBiometricsImageWidth}
                    iconHeight={variables.errorPageBiometricsImageHeight}
                    contentFitImage='fill'
                    title={translate('initialSettingsPage.troubleshoot.biometrics.errorPageTitle')}
                    subtitle={translate('initialSettingsPage.troubleshoot.biometrics.errorPageContent')}
                    testID={EnableBiometricsErrorPage.displayName}
                />
            </View>
            <View style={[styles.flexRow, styles.m5]}>
                <Button
                    success
                    style={[styles.flex1]}
                    onPress={() => Navigation.goBack()}
                    text={translate('common.buttonConfirm')}
                />
            </View>
        </ScreenWrapper>
    );
}

EnableBiometricsErrorPage.displayName = 'EnableBiometricsErrorPage';

export default EnableBiometricsErrorPage;
