import React, {useMemo} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import TestToolMenu from '@components/TestToolMenu';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyxWipe from '@hooks/useOnyxWipe';
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
    const wipeOnyx = useOnyxWipe();

    const menuItems = useMemo(() => {
        const baseMenuItems = [
            {
                translationKey: 'initialSettingsPage.troubleshooting.resetAndRefresh',
                icon: Expensicons.RotateLeft,
                action: () => wipeOnyx(),
            },
            {
                translationKey: 'initialSettingsPage.troubleshooting.viewConsole',
                icon: Expensicons.Monitor,
                action: () => console.log('ok'),
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
        }));
    }, [translate, wipeOnyx]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.aboutPage.troubleshooting')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.PREFERENCES.ROOT].backgroundColor}
            illustration={LottieAnimations.PreferencesDJ}
        >
            <MenuItemList
                menuItems={menuItems}
                shouldUseSingleExecution
            />
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
