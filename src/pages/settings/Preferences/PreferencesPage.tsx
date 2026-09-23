import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDocumentTitle from '@hooks/useDocumentTitle';
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
import {getBaseTheme} from '@styles/theme/utils';

import CONST from '@src/CONST';
import {isFullySupportedLocale, LOCALE_TO_LANGUAGE_STRING} from '@src/CONST/LOCALES';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import usePreferencesSectionIllustration from './usePreferencesSectionIllustration';

function PreferencesPage() {
    const {getCurrencySymbol} = useCurrencyListActions();
    const preferencesIllustration = usePreferencesSectionIllustration();
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);

    const platform = getPlatform(true);
    const [mutedPlatforms = getEmptyObject<Partial<Record<Platform, true>>>()] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms[platform];
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const personalPolicy = usePolicy(personalPolicyID);

    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    useDocumentTitle(translate('common.preferences'));

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="PreferencesPage"
        >
            <HeaderWithBackButton
                title={translate('common.preferences')}
                shouldUseHeadlineHeader
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
                onBackButtonPress={Navigation.goBack}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('preferencesPage.appSection.title')}
                        titleStyles={styles.accountSettingsSectionTitle}
                        isCentralPane
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.blue500}
                        {...preferencesIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.sectionMenuItemTopDescription]}>
                                <View style={styles.flex4}>
                                    <Text
                                        accessible={false}
                                        aria-hidden
                                    >
                                        {translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                                    </Text>
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
                                    <Text
                                        accessible={false}
                                        aria-hidden
                                    >
                                        {translate('preferencesPage.muteAllSounds')}
                                    </Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('preferencesPage.muteAllSounds')}
                                        isOn={isPlatformMuted ?? false}
                                        onToggle={() => togglePlatformMute(platform, mutedPlatforms)}
                                    />
                                </View>
                            </View>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIORITY_MODE)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.PRIORITY_MODE}
                            >
                                <MenuItemField.Row
                                    name={translate('priorityModePage.priorityMode')}
                                    value={translate(`priorityModePage.priorityModes.${priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}.label`)}
                                >
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_LANGUAGE)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.LANGUAGE}
                            >
                                <MenuItemField.Row
                                    name={translate('languagePage.language')}
                                    value={preferredLocale ? LOCALE_TO_LANGUAGE_STRING[preferredLocale] : undefined}
                                >
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                                {(!preferredLocale || !isFullySupportedLocale(preferredLocale)) && <MenuItem.HelpText message={translate('languagePage.aiGenerated')} />}
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENT_CURRENCY)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.PAYMENT_CURRENCY}
                            >
                                <MenuItemField.Row
                                    name={translate('billingCurrency.paymentCurrency')}
                                    value={`${paymentCurrency} - ${getCurrencySymbol(paymentCurrency)}`}
                                >
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_THEME)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.THEME}
                            >
                                <MenuItemField.Row
                                    name={translate('themePage.theme')}
                                    value={translate(`themePage.themes.${getBaseTheme(preferredTheme ?? CONST.THEME.DEFAULT)}.label`)}
                                >
                                    <MenuItem.Chevron />
                                </MenuItemField.Row>
                            </MenuItemSectionRow>
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default PreferencesPage;
