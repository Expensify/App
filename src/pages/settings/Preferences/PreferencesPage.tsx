import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {togglePlatformMute, updateNewsletterSubscription} from '@libs/actions/User';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import getPlatform from '@libs/getPlatform';
import LocaleUtils from '@libs/LocaleUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function PreferencesPage() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);

    const platform = getPlatform(true);
    const [mutedPlatforms = {}] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms[platform];
    const [user] = useOnyx(ONYXKEYS.USER);
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const personalPolicy = usePolicy(getPersonalPolicy()?.id);

    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={PreferencesPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.preferences')}
                icon={Illustrations.Gears}
                shouldUseHeadlineHeader
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('preferencesPage.appSection.title')}
                        isCentralPane
                        illustration={LottieAnimations.PreferencesDJ}
                        titleStyles={styles.accountSettingsSectionTitle}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.sectionMenuItemTopDescription]}>
                                <View style={styles.flex4}>
                                    <Text>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                                        isOn={user?.isSubscribedToNewsletter ?? true}
                                        onToggle={updateNewsletterSubscription}
                                    />
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween]}>
                                <View style={styles.flex4}>
                                    <Text>{translate('preferencesPage.muteAllSounds')}</Text>
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
                                title={translate(`languagePage.languages.${LocaleUtils.getLanguageFromLocale(preferredLocale)}.label`)}
                                description={translate('languagePage.language')}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_LANGUAGE)}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
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

PreferencesPage.displayName = 'PreferencesPage';

export default PreferencesPage;
