import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemList from '@components/MenuItemList';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {isInternalTestBuild} from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import {showContextMenu} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import colors from '@styles/theme/colors';
import {openExternalLink} from '@userActions/Link';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import pkg from '../../../../package.json';
import useAboutSectionIllustration from './useAboutSectionIllustration';

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
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'Link', 'Keyboard', 'Eye', 'MoneyBag', 'Bug']);
    const illustrations = useMemoizedLazyIllustrations(['PalmTree']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverAnchor = useRef<View>(null);
    const waitForNavigate = useWaitForNavigation();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const aboutIllustration = useAboutSectionIllustration();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});

    const menuItems = useMemo(() => {
        const baseMenuItems: MenuItem[] = [
            {
                translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
                icon: icons.Link,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS)),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewKeyboardShortcuts',
                icon: icons.Keyboard,
                action: waitForNavigate(() => Navigation.navigate(ROUTES.KEYBOARD_SHORTCUTS.getRoute(Navigation.getActiveRoute()))),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
                icon: icons.Eye,
                iconRight: icons.NewWindow,
                action: () => {
                    openExternalLink(CONST.GITHUB_URL);
                    return Promise.resolve();
                },
                link: CONST.GITHUB_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
                icon: icons.MoneyBag,
                iconRight: icons.NewWindow,
                action: () => {
                    openExternalLink(CONST.UPWORK_URL);
                    return Promise.resolve();
                },
                link: CONST.UPWORK_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.reportABug',
                icon: icons.Bug,
                action: waitForNavigate(() => navigateToConciergeChat(conciergeReportID, false)),
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
                ? (event: GestureResponderEvent | MouseEvent) =>
                      showContextMenu({
                          type: CONST.CONTEXT_MENU_TYPES.LINK,
                          event,
                          selection: link,
                          contextMenuAnchor: popoverAnchor.current,
                      })
                : undefined,
            ref: popoverAnchor,
            shouldBlockSelection: !!link,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }));
    }, [icons, styles, translate, waitForNavigate, conciergeReportID]);

    const overlayContent = useCallback(
        () => (
            <View style={[styles.pAbsolute, styles.w100, styles.h100, styles.justifyContentEnd, styles.pb3]}>
                <Text
                    selectable
                    style={[styles.textLabel, styles.textVersion, styles.alignSelfCenter]}
                >
                    v{isInternalTestBuild() ? `${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}${getFlavor()}` : `${pkg.version}${getFlavor()}`}
                </Text>
            </View>
        ),
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            testID="AboutPage"
        >
            <HeaderWithBackButton
                title={translate('initialSettingsPage.about')}
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter
                onBackButtonPress={Navigation.popToSidebar}
                icon={illustrations.PalmTree}
                shouldUseHeadlineHeader
            />
            <ScrollView contentContainerStyle={styles.pt3}>
                <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('footer.aboutExpensify')}
                        subtitle={translate('initialSettingsPage.aboutPage.description')}
                        isCentralPane
                        subtitleMuted
                        illustrationContainerStyle={styles.cardSectionIllustrationContainer}
                        illustrationBackgroundColor={colors.yellow600}
                        titleStyles={styles.accountSettingsSectionTitle}
                        overlayContent={overlayContent}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...aboutIllustration}
                    >
                        <View style={[styles.flex1, styles.mt5]}>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
                    </Section>
                </View>
                <View style={[styles.renderHTML, styles.pl5, styles.mb5]}>
                    <RenderHTML html={translate('initialSettingsPage.readTheTermsAndPrivacy')} />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AboutPage;
