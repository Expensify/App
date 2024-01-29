import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import * as Expensicons from '@components/Icon/Expensicons';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import TestToolMenu from '@components/TestToolMenu';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as App from '@userActions/App';
import * as Report from '@userActions/Report';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const keysToPreserve: OnyxKey[] = [
    ONYXKEYS.ACCOUNT,
    ONYXKEYS.ACTIVE_CLIENTS,
    ONYXKEYS.CREDENTIALS,
    ONYXKEYS.DEVICE_ID,
    ONYXKEYS.IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.IS_LOADING_REPORT_DATA,
    ONYXKEYS.IS_SIDEBAR_LOADED,
    ONYXKEYS.MODAL,
    ONYXKEYS.NETWORK,
    ONYXKEYS.PERSISTED_REQUESTS,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
    ONYXKEYS.NVP_PRIORITY_MODE,
    ONYXKEYS.SESSION,
    ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
    ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    ONYXKEYS.LOGIN_LIST,
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
];

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: React.FC<SvgProps>;
    action: () => void;
};

function TroubleshootingPage() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();

    const clearOnyx = useCallback(() => {
        Onyx.clear(keysToPreserve).then(() => {
            App.openApp();
        });
    }, []);

    const menuItems = useMemo(() => {
        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshooting.resetAndRefresh',
                icon: Expensicons.RotateLeft,
                action: clearOnyx,
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
        }));
    }, [clearOnyx, translate]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.aboutPage.troubleshooting')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.TROUBLESHOOTING].backgroundColor}
            illustration={LottieAnimations.Desk}
        >
            <View style={[styles.settingsPageBody, styles.ph5]}>
                <Text style={[styles.textHeadline, styles.mb1]}>{translate('initialSettingsPage.aboutPage.troubleshooting')}</Text>
                <Text style={styles.mb4}>
                    <Text>{translate('initialSettingsPage.troubleshooting.description')}</Text>{' '}
                    <TextLink
                        style={styles.link}
                        onPress={() => Report.navigateToConciergeChat()}
                    >
                        {translate('initialSettingsPage.troubleshooting.submitBug')}
                    </TextLink>
                </Text>
            </View>
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
