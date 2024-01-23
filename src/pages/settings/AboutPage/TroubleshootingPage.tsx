import React from 'react';
import {View} from 'react-native';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import TestToolMenu from '@components/TestToolMenu';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

function TroubleshootingPage() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.aboutPage.troubleshooting')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.PREFERENCES.ROOT].backgroundColor}
            illustration={LottieAnimations.PreferencesDJ}
        >
            {/* Enable additional test features in non-production environments */}
            {!isProduction && (
                <View style={[styles.ml5, styles.mr8, styles.mt6]}>
                    <TestToolMenu />
                </View>
            )}
        </IllustratedHeaderPageLayout>
    );
}

export default TroubleshootingPage;
