import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, StyleProp, ViewStyle} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import * as Environment from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import pkg from '../../../../package.json';

function getFlavor(): string {
    const bundleId = DeviceInfo.getBundleId();
    if (bundleId.includes('dev')) {
        return ' Develop';
    }
    if (bundleId.includes('adhoc')) {
        return ' Ad-Hoc';
    }
    return '';
}

type MenuItem = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    iconRight?: IconAsset;
    action: () => Promise<void>;
    link?: string;
    wrapperStyle?: StyleProp<ViewStyle>;
};

function AboutPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View | RNText | null>(null);
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const menuItems = useMemo(() => {
        const baseMenuItems: MenuItem[] = [
            {
                translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
                icon: Expensicons.Link,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewKeyboardShortcuts',
                icon: Expensicons.Keyboard,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS)),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
                icon: Expensicons.Eye,
                iconRight: Expensicons.NewWindow,
                action: () => {
                    Link.openExternalLink(CONST.GITHUB_URL);
                    return Promise.resolve();
                },
                link: CONST.GITHUB_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
                icon: Expensicons.MoneyBag,
                iconRight: Expensicons.NewWindow,
                action: () => {
                    Link.openExternalLink(CONST.UPWORK_URL);
                    return Promise.resolve();
                },
                link: CONST.UPWORK_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.reportABug',
                icon: Expensicons.Bug,
                action: waitForNavigate(Report.navigateToConciergeChat),
            },
        ];

        return baseMenuItems.map(({translationKey, icon, iconRight, action, link}: MenuItem) => ({
            key: translationKey,
            title: translate(translationKey),
            icon,
            iconRight,
            onPress: action,
            shouldShowRightIcon: true,
            onSecondaryInteraction: link
                ? (event: GestureResponderEvent | MouseEvent) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, event, link, popoverAnchor.current)
                : undefined,
            ref: popoverAnchor,
            shouldBlockSelection: !!link,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [styles, translate, waitForNavigate]);

    const overlayContent = useCallback(
        () => (
            <View style={[styles.pAbsolute, styles.w100, styles.h100, styles.justifyContentEnd, styles.pb3]}>
                <Text
                    selectable
                    style={[styles.textLabel, styles.textVersion, styles.alignSelfCenter]}
                >
                    v{Environment.isInternalTestBuild() ? `${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}${getFlavor()}` : `${pkg.version}${getFlavor()}`}
                </Text>
            </View>
        ),
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID={AboutPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.about')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                icon={Illustrations.PalmTree}
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('footer.aboutExpensify')}
                        subtitle={translate('initialSettingsPage.aboutPage.description')}
                        isCentralPane
                        subtitleMuted
                        illustration={LottieAnimations.Coin}
                        titleStyles={styles.accountSettingsSectionTitle}
                        overlayContent={overlayContent}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </Section>
                </View>
                <View style={[styles.sidebarFooter, styles.mb5]}>
                    <Text
                        style={[styles.chatItemMessageHeaderTimestamp]}
                        numberOfLines={1}
                    >
                        {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase1')}{' '}
                        <TextLink
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.TERMS_URL}
                        >
                            {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase2')}
                        </TextLink>{' '}
                        {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase3')}{' '}
                        <TextLink
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.PRIVACY_URL}
                        >
                            {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase4')}
                        </TextLink>
                        .
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

AboutPage.displayName = 'AboutPage';

export default AboutPage;
