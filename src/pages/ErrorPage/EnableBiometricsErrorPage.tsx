import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';

function EnableBiometricsErrorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <ScreenWrapper testID={EnableBiometricsErrorPage.displayName}>
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
                    contentFitImage="fill"
                    title={translate('initialSettingsPage.troubleshoot.biometrics.errorPageTitle')}
                    subtitle={translate('initialSettingsPage.troubleshoot.biometrics.errorPageContent')}
                    subtitleStyle={styles.textSupporting}
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
