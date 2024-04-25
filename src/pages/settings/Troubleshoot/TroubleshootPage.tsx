import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import ClientSideLoggingToolMenu from '@components/ClientSideLoggingToolMenu';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import TestToolMenu from '@components/TestToolMenu';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import useWindowDimensions from '@hooks/useWindowDimensions';
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
    const {isSmallScreenWidth} = useWindowDimensions();

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
                wrapperStyle: [styles.sectionMenuItemTopDescription],
            }))
            .reverse();
    }, [shouldStoreLogs, translate, waitForNavigate, styles.sectionMenuItemTopDescription]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={TroubleshootPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                shouldShowBackButton={isSmallScreenWidth}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                icon={Illustrations.Lightbulb}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                        subtitle={translate('initialSettingsPage.troubleshoot.description')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.Desk}
                        illustrationStyle={[styles.mt4, styles.mbn4]}
                        titleStyles={styles.accountSettingsSectionTitle}
                        illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.TROUBLESHOOT].backgroundColor}
                        renderSubtitle={() => (
                            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('initialSettingsPage.troubleshoot.description')}</Text>{' '}
                                <TextLink
                                    style={styles.link}
                                    onPress={() => Report.navigateToConciergeChat()}
                                >
                                    {translate('initialSettingsPage.troubleshoot.submitBug')}
                                </TextLink>
                                .
                            </Text>
                        )}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View>
                                <ClientSideLoggingToolMenu />
                            </View>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                            {!isProduction && (
                                <View style={[styles.mt6]}>
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
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

TroubleshootPage.displayName = 'TroubleshootPage';

export default withOnyx<TroubleshootPageProps, TroubleshootPageOnyxProps>({
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(TroubleshootPage);
