import React, {useMemo, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import _ from 'underscore';
import Logo from '@assets/images/new-expensify.svg';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import compose from '@libs/compose';
import * as Environment from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import {CONTEXT_MENU_TYPES} from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
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
            onSecondaryInteraction: !_.isEmpty(item.link) ? (e) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, item.link, popoverAnchor) : undefined,
            ref: popoverAnchor,
            shouldBlockSelection: Boolean(item.link),
        }));
    }, [translate, waitForNavigate]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AboutPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={props.translate('initialSettingsPage.about')}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
                    />
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween, safeAreaPaddingBottomStyle]}>
                        <View style={[styles.flex1]}>
                            <View style={[styles.pageWrapper, styles.pv3]}>
                                <View style={[styles.settingsPageBody, styles.mb6, styles.alignItemsCenter]}>
                                    <Logo
                                        height={80}
                                        width={80}
                                    />
                                    <Text style={[styles.textLabel, styles.alignSelfCenter, styles.mt6, styles.mb2, styles.colorMuted, styles.userSelectText]}>
                                        v{Environment.isInternalTestBuild() ? `${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}${getFlavor()}` : `${pkg.version}${getFlavor()}`}
                                    </Text>
                                    <Text style={[styles.baseFontStyle, styles.mv5]}>{props.translate('initialSettingsPage.aboutPage.description')}</Text>
                                </View>
                            </View>
                            <MenuItemList
                                menuItems={menuItems}
                                shouldUseSingleExecution
                            />
                        </View>
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
                    </ScrollView>
                </>
            )}
        </ScreenWrapper>
    );
}

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default compose(withLocalize, withWindowDimensions)(AboutPage);
