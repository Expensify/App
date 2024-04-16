import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import ClientSideLoggingToolMenu from '@components/ClientSideLoggingToolMenu';
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
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import * as App from '@userActions/App';
import * as Report from '@userActions/Report';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: React.FC<SvgProps>;
    action: () => void | Promise<void>;
};

type TroubleshootPageOnyxProps = {
    shouldStoreLogs: OnyxEntry<boolean>;
};

type TroubleshootPageProps = TroubleshootPageOnyxProps;

function TroubleshootPage({shouldStoreLogs}: TroubleshootPageProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const waitForNavigate = useWaitForNavigation();

    const menuItems = useMemo(() => {
        const debugConsoleItem: BaseMenuItem = {
            translationKey: 'initialSettingsPage.troubleshoot.viewConsole',
            icon: Expensicons.Gear,
            action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CONSOLE)),
        };

        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: Expensicons.RotateLeft,
                action: () => setIsConfirmationModalVisible(true),
            },
        ];

        if (shouldStoreLogs) {
            baseMenuItems.push(debugConsoleItem);
        }

        return baseMenuItems
            .map((item) => ({
                key: item.translationKey,
                title: translate(item.translationKey),
                icon: item.icon,
                onPress: item.action,
            }))
            .reverse();
    }, [shouldStoreLogs, translate, waitForNavigate]);

    return (
        <IllustratedHeaderPageLayout
            title={translate('initialSettingsPage.aboutPage.troubleshoot')}
            onBackButtonPress={() => Navigation.goBack()}
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
            <View style={[styles.ml5, styles.mr8]}>
                <ClientSideLoggingToolMenu />
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
                    Onyx.clear(App.KEYS_TO_PRESERVE).then(() => {
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

export default withOnyx<TroubleshootPageProps, TroubleshootPageOnyxProps>({
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(TroubleshootPage);
