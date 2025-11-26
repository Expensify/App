import {differenceInDays} from 'date-fns';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import ImportOnyxState from '@components/ImportOnyxState';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import {useOptionsList} from '@components/OptionListContextProvider';
import RecordTroubleshootDataToolMenu from '@components/RecordTroubleshootDataToolMenu';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchContext} from '@components/Search/SearchContext';
import Section from '@components/Section';
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
import Navigation from '@libs/Navigation/Navigation';
import {clearOnyxAndResetApp} from '@userActions/App';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';

type BaseMenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void | Promise<void>;
};

function TroubleshootPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'ExpensifyLogoNew'] as const);
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb'] as const);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction} = useEnvironment();
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
        if (!tryNewDot?.classicRedirect?.timestamp || !tryNewDot?.classicRedirect?.dismissed) {
            return false;
        }
        const daysSinceLastSurvey = differenceInDays(new Date(), new Date(tryNewDot.classicRedirect.timestamp));
        return daysSinceLastSurvey < surveyThresholdInDays;
    }, [tryNewDot?.classicRedirect?.timestamp, tryNewDot?.classicRedirect?.dismissed]);

    const classicRedirectMenuItem: BaseMenuItem | null = useMemo(() => {
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
    }, [icons.Download, waitForNavigate, exportOnyxState, shouldStoreLogs, translate, styles.sectionMenuItemTopDescription, classicRedirectMenuItem]);

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
                        illustration={LottieAnimations.Desk}
                        titleStyles={styles.accountSettingsSectionTitle}
                        renderSubtitle={() => (
                            <View style={[styles.renderHTML, styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <RenderHTML html={translate('initialSettingsPage.troubleshoot.description')} />
                            </View>
                        )}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View>
                                <RecordTroubleshootDataToolMenu />
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

TroubleshootPage.displayName = 'TroubleshootPage';

export default TroubleshootPage;
