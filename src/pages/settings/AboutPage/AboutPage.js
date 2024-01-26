import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import _ from 'underscore';
import * as Expensicons from '@components/Icon/Expensicons';
import IllustratedHeaderPageLayout from '@components/IllustratedHeaderPageLayout';
import LottieAnimations from '@components/LottieAnimations';
import MenuItemList from '@components/MenuItemList';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import compose from '@libs/compose';
import * as Environment from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import pkg from '../../../../package.json';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function getFlavor() {
    const bundleId = DeviceInfo.getBundleId();
    if (bundleId.includes('dev')) {
        return ' Develop';
    }
    if (bundleId.includes('adhoc')) {
        return ' Ad-Hoc';
    }
    return '';
}

function AboutPage(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = props;
    const popoverAnchor = useRef(null);
    const waitForNavigate = useWaitForNavigation();

    const menuItems = useMemo(() => {
        const baseMenuItems = [
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
                },
                link: CONST.GITHUB_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
                icon: Expensicons.MoneyBag,
                iconRight: Expensicons.NewWindow,
                action: () => {
                    Link.openExternalLink(CONST.UPWORK_URL);
                },
                link: CONST.UPWORK_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.reportABug',
                icon: Expensicons.Bug,
                action: waitForNavigate(Report.navigateToConciergeChat),
            },
        ];
        return _.map(baseMenuItems, (item) => ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            iconRight: item.iconRight,
            onPress: item.action,
            shouldShowRightIcon: true,
            onSecondaryInteraction: !_.isEmpty(item.link) ? (e) => ReportActionContextMenu.showContextMenu(CONST.CONTEXT_MENU_TYPES.LINK, e, item.link, popoverAnchor) : undefined,
            ref: popoverAnchor,
            shouldBlockSelection: Boolean(item.link),
        }));
    }, [translate, waitForNavigate]);

    const overlayContent = useCallback(
        () => (
            <View style={[styles.pAbsolute, styles.w100, styles.h100, styles.justifyContentEnd, styles.pb5]}>
                <Text
                    selectable
                    style={[styles.textLabel, styles.textIvoryLight, styles.alignSelfCenter]}
                >
                    v{Environment.isInternalTestBuild() ? `${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}${getFlavor()}` : `${pkg.version}${getFlavor()}`}
                </Text>
            </View>
        ),
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <IllustratedHeaderPageLayout
            title={props.translate('initialSettingsPage.about')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.Coin}
            backgroundColor={theme.PAGE_THEMES[SCREENS.SETTINGS.ABOUT].backgroundColor}
            overlayContent={overlayContent}
        >
            <View style={[styles.settingsPageBody, styles.ph5]}>
                <Text style={[styles.textHeadline, styles.mb1]}>{props.translate('footer.aboutExpensify')}</Text>
                <Text style={[styles.baseFontStyle, styles.mb4]}>{props.translate('initialSettingsPage.aboutPage.description')}</Text>
            </View>
            <MenuItemList
                menuItems={menuItems}
                shouldUseSingleExecution
            />
            <View style={[styles.sidebarFooter]}>
                <Text
                    style={[styles.chatItemMessageHeaderTimestamp]}
                    numberOfLines={1}
                >
                    {props.translate('initialSettingsPage.readTheTermsAndPrivacy.phrase1')}{' '}
                    <TextLink
                        style={[styles.textMicroSupporting, styles.link]}
                        href={CONST.TERMS_URL}
                    >
                        {props.translate('initialSettingsPage.readTheTermsAndPrivacy.phrase2')}
                    </TextLink>{' '}
                    {props.translate('initialSettingsPage.readTheTermsAndPrivacy.phrase3')}{' '}
                    <TextLink
                        style={[styles.textMicroSupporting, styles.link]}
                        href={CONST.PRIVACY_URL}
                    >
                        {props.translate('initialSettingsPage.readTheTermsAndPrivacy.phrase4')}
                    </TextLink>
                    .
                </Text>
            </View>
        </IllustratedHeaderPageLayout>
    );
}

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default compose(withLocalize, withWindowDimensions)(AboutPage);
