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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Browser from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import LocaleUtils from '@libs/LocaleUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function PreferencesPage() {
    const [priorityMode] = useOnyx(ONYXKEYS.NVP_PRIORITY_MODE);

    let platform = getPlatform();
    if (Browser.isMobile()) {
        platform = CONST.PLATFORM.MOBILEWEB;
    }
    const [mutedPlatforms] = useOnyx(ONYXKEYS.NVP_MUTED_PLATFORMS);
    const isPlatformMuted = mutedPlatforms?.includes(platform);
    const [user] = useOnyx(ONYXKEYS.USER);
    const [preferredTheme] = useOnyx(ONYXKEYS.PREFERRED_THEME);

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
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={() => Navigation.goBack()}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('preferencesPage.appSection.title')}
                        subtitle={translate('preferencesPage.appSection.subtitle')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.PreferencesDJ}
                        titleStyles={styles.accountSettingsSectionTitle}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <Text
                                style={[styles.textLabelSupporting, styles.mb2]}
                                numberOfLines={1}
                            >
                                {translate('common.notifications')}
                            </Text>
                            <View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.sectionMenuItemTopDescription]}>
                                <View style={styles.flex4}>
                                    <Text>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text>
                                </View>
                                <View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch
                                        accessibilityLabel={translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}
                                        isOn={user?.isSubscribedToNewsletter ?? true}
                                        onToggle={User.updateNewsletterSubscription}
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
                                        // isOn={user?.isMutedAllSounds ?? false}
                                        onToggle={() => User.togglePlatformMute(platform, mutedPlatforms)}
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
