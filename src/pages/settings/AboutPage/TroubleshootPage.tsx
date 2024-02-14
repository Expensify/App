import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import ConfirmModal from '@components/ConfirmModal';
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
    ONYXKEYS.IS_CHECKING_PUBLIC_ROOM,
    ONYXKEYS.IS_LOADING_APP,
    ONYXKEYS.IS_SIDEBAR_LOADED,
    ONYXKEYS.MODAL,
    ONYXKEYS.NETWORK,
    ONYXKEYS.SESSION,
    ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT,
    ONYXKEYS.NVP_TRY_FOCUS_MODE,
    ONYXKEYS.PREFERRED_THEME,
    ONYXKEYS.NVP_PREFERRED_LOCALE,
];

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: React.FC<SvgProps>;
    action: () => void;
};

function TroubleshootPage() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);

    const menuItems = useMemo(() => {
        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: Expensicons.RotateLeft,
                action: () => setIsConfirmationModalVisible(true),
            },
        ];

        return baseMenuItems.map((item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
        }));
    }, [translate]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.aboutPage.troubleshoot')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.TROUBLESHOOT].backgroundColor}
            illustration={LottieAnimations.Desk}
            testID={TroubleshootPage.displayName}
        >
            <View style={[styles.settingsPageBody, styles.ph5]}>
                <Text style={[styles.textHeadline, styles.mb1]}>{translate('initialSettingsPage.aboutPage.troubleshoot')}</Text>
                <Text style={styles.mb4}>
                    <Text>{translate('initialSettingsPage.troubleshoot.description')}</Text>{' '}
                    <TextLink
                        style={styles.link}
                        onPress={() => Report.navigateToConciergeChat()}
                    >
                        {translate('initialSettingsPage.troubleshoot.submitBug')}
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
            <ConfirmModal
                title={translate('common.areYouSure')}
                isVisible={isConfirmationModalVisible}
                onConfirm={() => {
                    setIsConfirmationModalVisible(false);
                    Onyx.clear(keysToPreserve).then(() => {
                        App.openApp();
                    });
                }}
                onCancel={() => setIsConfirmationModalVisible(false)}
                prompt={translate('initialSettingsPage.troubleshoot.confirmResetDescription')}
                confirmText={translate('initialSettingsPage.troubleshoot.resetAndRefresh')}
                cancelText={translate('common.cancel')}
            />
        </IllustratedHeaderPageLayout>
    );
}

TroubleshootPage.displayName = 'TroubleshootPage';

export default TroubleshootPage;
