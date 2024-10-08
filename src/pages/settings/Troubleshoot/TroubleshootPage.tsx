import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import ClientSideLoggingToolMenu from '@components/ClientSideLoggingToolMenu';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ImportOnyxState from '@components/ImportOnyxState';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Switch from '@components/Switch';
import TestToolMenu from '@components/TestToolMenu';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {setShouldMaskOnyxState} from '@libs/actions/MaskOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import Navigation from '@libs/Navigation/Navigation';
import {clearOnyxAndResetApp} from '@userActions/App';
import * as Report from '@userActions/Report';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import getLightbulbIllustrationStyle from './getLightbulbIllustrationStyle';

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: React.FC<SvgProps>;
    action: () => void | Promise<void>;
};

function TroubleshootPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrationStyle = getLightbulbIllustrationStyle();
    const [isLoading, setIsLoading] = useState(false);
    const [shouldStoreLogs] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS);
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE);

    const exportOnyxState = useCallback(() => {
        ExportOnyxState.readFromOnyxDatabase().then((value: Record<string, unknown>) => {
            const dataToShare = ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState);
            ExportOnyxState.shareAsFile(JSON.stringify(dataToShare));
        });
    }, [shouldMaskOnyxState]);

    const menuItems = useMemo(() => {
        const debugConsoleItem: BaseMenuItem = {
            translationKey: 'initialSettingsPage.troubleshoot.viewConsole',
            icon: Expensicons.Bug,
            action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CONSOLE.getRoute(ROUTES.SETTINGS_TROUBLESHOOT))),
        };

        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: Expensicons.RotateLeft,
                action: () => setIsConfirmationModalVisible(true),
            },
            {
                translationKey: 'initialSettingsPage.troubleshoot.exportOnyxState',
                icon: Expensicons.Download,
                action: exportOnyxState,
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
    }, [waitForNavigate, exportOnyxState, shouldStoreLogs, translate, styles.sectionMenuItemTopDescription]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={TroubleshootPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                icon={Illustrations.Lightbulb}
            />
            {isLoading && <FullScreenLoadingIndicator />}
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                        subtitle={translate('initialSettingsPage.troubleshoot.description')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.Desk}
                        illustrationStyle={illustrationStyle}
                        titleStyles={styles.accountSettingsSectionTitle}
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
                                <TestToolRow title={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}>
                                    <Switch
                                        accessibilityLabel={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}
                                        isOn={shouldMaskOnyxState}
                                        onToggle={setShouldMaskOnyxState}
                                    />
                                </TestToolRow>
                            </View>
                            <ImportOnyxState
                                setIsLoading={setIsLoading}
                                isLoading={isLoading}
                            />
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
                                    clearOnyxAndResetApp();
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

export default TroubleshootPage;
