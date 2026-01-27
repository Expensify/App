import {differenceInDays} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportOnyxState from '@components/ImportOnyxState';
import MenuItemList from '@components/MenuItemList';
import {useOptionsList} from '@components/OptionListContextProvider';
import RecordTroubleshootDataToolMenu from '@components/RecordTroubleshootDataToolMenu';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Section from '@components/Section';
import SentryDebugToolMenu from '@components/SentryDebugToolMenu';
import Switch from '@components/Switch';
import TestToolMenu from '@components/TestToolMenu';
import TestToolRow from '@components/TestToolRow';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {openOldDotLink} from '@libs/actions/Link';
import {setShouldMaskOnyxState} from '@libs/actions/MaskOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import {clearOnyxAndResetApp} from '@userActions/App';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import useTroubleshootSectionIllustration from './useTroubleshootSectionIllustration';

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void | Promise<void>;
};

function TroubleshootPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'ExpensifyLogoNew', 'Bug', 'RotateLeft']);
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb']);
    const troubleshootIllustration = useTroubleshootSectionIllustration();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction, isDevelopment} = useEnvironment();
    const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isLoading, setIsLoading] = useState(false);
    const [shouldStoreLogs] = useOnyx(ONYXKEYS.SHOULD_STORE_LOGS, {canBeMissing: true});
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE, {canBeMissing: true});
    const {resetOptions} = useOptionsList({shouldInitialize: false});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;
    const {setShouldResetSearchQuery} = useSearchContext();
    const exportOnyxState = useCallback(() => {
        ExportOnyxState.readFromOnyxDatabase().then((value: Record<string, unknown>) => {
            const dataToShare = ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState);
            ExportOnyxState.shareAsFile(JSON.stringify(dataToShare));
        });
    }, [shouldMaskOnyxState]);

    const surveyCompletedWithinLastMonth = useMemo(() => {
        const surveyThresholdInDays = 30;
        const {dismissedReasons} = tryNewDot?.classicRedirect ?? {};
        if (dismissedReasons?.length === 0) {
            return false;
        }

        let timestampToCheck;
        if (dismissedReasons && dismissedReasons.length > 0) {
            const latestReason = dismissedReasons.reduce((latest, current) => {
                const currentDate = current.timestamp;
                const latestDate = latest.timestamp;
                return currentDate > latestDate ? current : latest;
            });
            timestampToCheck = latestReason.timestamp;
        }

        if (!timestampToCheck) {
            return false;
        }

        const daysSinceLastSurvey = differenceInDays(new Date(), timestampToCheck);
        return daysSinceLastSurvey < surveyThresholdInDays;
    }, [tryNewDot?.classicRedirect]);

    const classicRedirectMenuItem: BaseMenuItem | null = useMemo(() => {
        const platform = getPlatform();
        const isMobileApp = [CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID].includes(platform as 'ios' | 'android');

        if (tryNewDot?.classicRedirect?.isLockedToNewApp && isMobileApp) {
            return null;
        }

        if (tryNewDot?.classicRedirect?.isLockedToNewDot) {
            return null;
        }

        return {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
            ...(CONFIG.IS_HYBRID_APP
                ? {
                      action: () => closeReactNativeApp({shouldSetNVP: true}),
                  }
                : {
                      action() {
                          if (surveyCompletedWithinLastMonth) {
                              openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
                              return;
                          }

                          resetExitSurveyForm(() => {
                              if (shouldOpenSurveyReasonPage) {
                                  Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_REASON);
                                  return;
                              }
                              Navigation.navigate(ROUTES.SETTINGS_EXIT_SURVEY_CONFIRM.route);
                          });
                      },
                  }),
        };
    }, [tryNewDot?.classicRedirect?.isLockedToNewDot, icons.ExpensifyLogoNew, surveyCompletedWithinLastMonth, shouldOpenSurveyReasonPage]);

    const menuItems = useMemo(() => {
        const debugConsoleItem: BaseMenuItem = {
            translationKey: 'initialSettingsPage.troubleshoot.viewConsole',
            icon: icons.Bug,
            action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_CONSOLE.getRoute(ROUTES.SETTINGS_TROUBLESHOOT))),
        };

        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: icons.RotateLeft,
                action: () => setIsConfirmationModalVisible(true),
            },
            {
                translationKey: 'initialSettingsPage.troubleshoot.exportOnyxState',
                icon: icons.Download,
                action: exportOnyxState,
            },
        ];

        if (shouldStoreLogs) {
            baseMenuItems.push(debugConsoleItem);
        }

        const finalMenuItems = classicRedirectMenuItem ? [classicRedirectMenuItem, ...baseMenuItems] : baseMenuItems;

        return finalMenuItems
            .map((item) => ({
                key: item.translationKey,
                title: translate(item.translationKey),
                icon: item.icon,
                onPress: item.action,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
            }))
            .reverse();
    }, [icons.Bug, icons.RotateLeft, icons.Download, waitForNavigate, exportOnyxState, shouldStoreLogs, classicRedirectMenuItem, translate, styles.sectionMenuItemTopDescription]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="TroubleshootPage"
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={Navigation.popToSidebar}
                icon={illustrations.Lightbulb}
                shouldUseHeadlineHeader
            />
            {isLoading && <FullScreenLoadingIndicator />}
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('initialSettingsPage.aboutPage.troubleshoot')}
                        subtitle={translate('initialSettingsPage.troubleshoot.description')}
                        isCentralPane
                        subtitleMuted
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.blue700}
                        titleStyles={styles.accountSettingsSectionTitle}
                        renderSubtitle={() => (
                            <View style={[styles.renderHTML, styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <RenderHTML html={translate('initialSettingsPage.troubleshoot.description')} />
                            </View>
                        )}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...troubleshootIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View>
                                {!isProduction && <RecordTroubleshootDataToolMenu />}
                                <TestToolRow title={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}>
                                    <Switch
                                        accessibilityLabel={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}
                                        isOn={shouldMaskOnyxState}
                                        onToggle={setShouldMaskOnyxState}
                                    />
                                </TestToolRow>
                            </View>
                            <ImportOnyxState setIsLoading={setIsLoading} />
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                            {!isProduction && (
                                <View style={[styles.mt6]}>
                                    <TestToolMenu />
                                </View>
                            )}
                            {isDevelopment && (
                                <View style={[styles.mt6]}>
                                    <SentryDebugToolMenu />
                                </View>
                            )}

                            <ConfirmModal
                                title={translate('common.areYouSure')}
                                isVisible={isConfirmationModalVisible}
                                onConfirm={() => {
                                    setIsConfirmationModalVisible(false);
                                    resetOptions();
                                    setShouldResetSearchQuery(true);
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

export default TroubleshootPage;
