import {differenceInDays} from 'date-fns';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ImportOnyxState from '@components/ImportOnyxState';
import MenuItemList from '@components/MenuItemList';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useOptionsList} from '@components/OptionListContextProvider';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import Section from '@components/Section';
import SentryDebugToolMenu from '@components/SentryDebugToolMenu';
import Switch from '@components/Switch';
import TestToolMenu from '@components/TestToolMenu';
import TestToolRow from '@components/TestToolRow';
import useConfirmModal from '@hooks/useConfirmModal';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetExitSurveyForm, switchToOldDot} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {openOldDotLink} from '@libs/actions/Link';
import {setShouldMaskOnyxState} from '@libs/actions/MaskOnyx';
import {openTroubleshootSettingsPage} from '@libs/actions/User';
import ExportOnyxState from '@libs/ExportOnyxState';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import {clearOnyxAndResetApp} from '@userActions/App';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';
import useTroubleshootSectionIllustration from './useTroubleshootSectionIllustration';

type BaseMenuItem = WithSentryLabel & {
    translationKey: TranslationPaths;
    icon: IconAsset;
    action: () => void | Promise<void>;
};

function TroubleshootPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Download', 'ExpensifyLogoNew', 'RotateLeft']);
    const illustrations = useMemoizedLazyIllustrations(['Lightbulb']);
    const troubleshootIllustration = useTroubleshootSectionIllustration();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isProduction, isDevelopment} = useEnvironment();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isLoading, setIsLoading] = useState(false);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE);
    const {resetOptions} = useOptionsList({shouldInitialize: false});
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const {showConfirmModal} = useConfirmModal();
    const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;
    const {setShouldResetSearchQuery} = useSearchActionsContext();
    useDocumentTitle(`${translate('common.settings')} - ${translate('initialSettingsPage.aboutPage.troubleshoot')}`);

    const showResetAndRefreshModal = async () => {
        const result = await showConfirmModal({
            title: translate('common.areYouSure'),
            prompt: translate('initialSettingsPage.troubleshoot.confirmResetDescription'),
            confirmText: translate('initialSettingsPage.troubleshoot.resetAndRefresh'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        resetOptions();
        setShouldResetSearchQuery(true);
        clearOnyxAndResetApp();
    };
    const exportOnyxState = useCallback(() => {
        ExportOnyxState.readFromOnyxDatabase().then((value: Record<string, unknown>) => {
            const dataToShare = ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState);
            ExportOnyxState.shareAsFile(JSON.stringify(dataToShare));
        });
    }, [shouldMaskOnyxState]);

    const getSurveyCompletedWithinLastMonth = () => {
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
    };
    const surveyCompletedWithinLastMonth = getSurveyCompletedWithinLastMonth();

    const getClassicRedirectMenuItem = (): BaseMenuItem | null => {
        if (tryNewDot?.classicRedirect?.isLockedToNewDot) {
            return null;
        }

        return {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_TROUBLESHOOT.GO_TO_CLASSIC,
            ...(CONFIG.IS_HYBRID_APP
                ? {
                      action: () => closeReactNativeApp({shouldSetNVP: true, isTrackingGPS}),
                  }
                : {
                      action() {
                          if (surveyCompletedWithinLastMonth) {
                              switchToOldDot('');
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
    };
    const classicRedirectMenuItem = getClassicRedirectMenuItem();

    const getMenuItems = () => {
        const baseMenuItems: BaseMenuItem[] = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: icons.RotateLeft,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_TROUBLESHOOT.CLEAR_CACHE,
                action: showResetAndRefreshModal,
            },
            {
                translationKey: 'initialSettingsPage.troubleshoot.exportOnyxState',
                icon: icons.Download,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_TROUBLESHOOT.EXPORT_ONYX,
                action: exportOnyxState,
            },
        ];

        const finalMenuItems = classicRedirectMenuItem ? [classicRedirectMenuItem, ...baseMenuItems] : baseMenuItems;

        return finalMenuItems
            .map((item) => ({
                key: item.translationKey,
                title: translate(item.translationKey),
                icon: item.icon,
                onPress: item.action,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                sentryLabel: item.sentryLabel,
            }))
            .reverse();
    };
    const menuItems = getMenuItems();

    useEffect(() => {
        openTroubleshootSettingsPage();
    }, []);

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
                shouldDisplayHelpButton
                onBackButtonPress={Navigation.goBack}
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
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default TroubleshootPage;
