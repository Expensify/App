import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useCurrencyList from '@hooks/useCurrencyList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {togglePlatformMute, updateNewsletterSubscription} from '@libs/actions/User';
import getPlatform from '@libs/getPlatform';
import type Platform from '@libs/getPlatform/types';
import Navigation from '@libs/Navigation/Navigation';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import {isFullySupportedLocale, LOCALE_TO_LANGUAGE_STRING} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import usePreferencesSectionIllustration from './usePreferencesSectionIllustration';

function PreferencesPage() {
    const {getCurrencySymbol} = useCurrencyList();
    const illustrations = useMemoizedLazyIllustrations(['Gears']);
    const preferencesIllustration = usePreferencesSectionIllustration();
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE, {canBeMissing: true});

    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS, {canBeMissing: true});
    const isPlatformMuted = mutedPlatforms[platform];
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME, {canBeMissing: true});
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});

    const personalPolicy = usePolicy(personalPolicyID);

    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="PreferencesPage"
        >
            <HeaderWithBackButton
                title={translate('common.preferences')}
                icon={illustrations.Gears}
                shouldUseHeadlineHeader
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={Navigation.popToSidebar}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('preferencesPage.appSection.title')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        isCentralPane
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.blue500}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...preferencesIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.sectionMenuItemTopDescription]}>
                                <View style={styles.flex4}>
                                    <Text accessible={false}>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                                        isOn={account?.isSubscribedToNewsletter ?? true}
                                        onToggle={updateNewsletterSubscription}
                                    />
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween]}>
                                <View style={styles.flex4}>
                                    <Text accessible={false}>{translate('preferencesPage.muteAllSounds')}</Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('preferencesPage.muteAllSounds')}
                                        isOn={isPlatformMuted ?? false}
                                        onToggle={() => togglePlatformMute(platform, mutedPlatforms)}
                                    />
                                </View>
                            </View>
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={translate(`priorityModePage.priorityModes.${priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}.label`)}
                                description={translate('priorityModePage.priorityMode')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIORITY_MODE)}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={preferredLocale ? LOCALE_TO_LANGUAGE_STRING[preferredLocale] : undefined}
                                description={translate('languagePage.language')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_LANGUAGE)}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                hintText={!preferredLocale || !isFullySupportedLocale(preferredLocale) ? translate('languagePage.aiGenerated') : ''}
                            />
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={`${paymentCurrency} - ${getCurrencySymbol(paymentCurrency)}`}
                                description={translate('billingCurrency.paymentCurrency')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENT_CURRENCY)}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={translate(`themePage.themes.${preferredTheme ?? CONST.THEME.DEFAULT}.label`)}
                                description={translate('themePage.theme')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_THEME)}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                            />
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default PreferencesPage;
