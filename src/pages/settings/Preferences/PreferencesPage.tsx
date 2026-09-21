import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
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
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldName>{translate('priorityModePage.priorityMode')}</MenuItem.FieldName>
                                        <MenuItem.FieldValue>{translate(`priorityModePage.priorityModes.${priorityMode ?? CONST.PRIORITY_MODE.DEFAULT}.label`)}</MenuItem.FieldValue>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_LANGUAGE)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.LANGUAGE}
                            >
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        {preferredLocale ? (
                                            <>
                                                <MenuItem.FieldName>{translate('languagePage.language')}</MenuItem.FieldName>
                                                <MenuItem.FieldValue>{LOCALE_TO_LANGUAGE_STRING[preferredLocale]}</MenuItem.FieldValue>
                                            </>
                                        ) : (
                                            <MenuItem.FieldNamePlaceholder>{translate('languagePage.language')}</MenuItem.FieldNamePlaceholder>
                                        )}
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                                {(!preferredLocale || !isFullySupportedLocale(preferredLocale)) && (
                                    <FormHelpMessage
                                        isError={false}
                                        shouldShowRedDotIndicator={false}
                                        message={translate('languagePage.aiGenerated')}
                                        style={styles.menuItemError}
                                    />
                                )}
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENT_CURRENCY)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.PAYMENT_CURRENCY}
                            >
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldName>{translate('billingCurrency.paymentCurrency')}</MenuItem.FieldName>
                                        <MenuItem.FieldValue>{`${paymentCurrency} - ${getCurrencySymbol(paymentCurrency)}`}</MenuItem.FieldValue>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItemSectionRow>
                            <MenuItemSectionRow
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_THEME)}
                                sentryLabel={CONST.SENTRY_LABEL.SETTINGS_PREFERENCES.THEME}
                            >
                                <MenuItem.Row>
                                    <MenuItem.Content>
                                        <MenuItem.FieldName>{translate('themePage.theme')}</MenuItem.FieldName>
                                        <MenuItem.FieldValue>{translate(`themePage.themes.${getBaseTheme(preferredTheme ?? CONST.THEME.DEFAULT)}.label`)}</MenuItem.FieldValue>
                                    </MenuItem.Content>
                                    <MenuItem.Trailing>
                                        <MenuItem.Chevron />
                                    </MenuItem.Trailing>
                                </MenuItem.Row>
                            </MenuItemSectionRow>
                        </View>
                    </Section>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default PreferencesPage;
