import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import MenuItem from '../../../components/MenuItem';
import pkg from '../../../../package.json';
import * as Report from '../../../libs/actions/Report';
import * as Link from '../../../libs/actions/Link';
import compose from '../../../libs/compose';
import * as ReportActionContextMenu from '../../home/report/ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from '../../home/report/ContextMenu/ContextMenuActions';
import * as KeyboardShortcuts from '../../../libs/actions/KeyboardShortcuts';
import * as Environment from '../../../libs/Environment/Environment';
import IllustratedHeaderPageLayout from '../../../components/IllustratedHeaderPageLayout';
import themeColors from '../../../styles/themes/default';
import * as LottieAnimations from '../../../components/LottieAnimations';
import SCREENS from '../../../SCREENS';

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
    let popoverAnchor;
    const menuItems = [
        {
            translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
            icon: Expensicons.Link,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewKeyboardShortcuts',
            icon: Expensicons.Keyboard,
            action: KeyboardShortcuts.showKeyboardShortcutModal,
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
            action: Report.navigateToConciergeChat,
        },
    ];

    const overlayContent = () => (
        <View style={[styles.pAbsolute, styles.w100, styles.h100, styles.justifyContentEnd, styles.mb3]}>
            <Text
                selectable
                style={[styles.textLabel, styles.textIvoryLight, styles.alignSelfCenter]}
            >
                v{Environment.isInternalTestBuild() ? `${pkg.version} PR:${CONST.PULL_REQUEST_NUMBER}${getFlavor()}` : `${pkg.version}${getFlavor()}`}
            </Text>
        </View>
    );

    return (
        <IllustratedHeaderPageLayout
            title={props.translate('initialSettingsPage.about')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            illustration={LottieAnimations.Coin}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.ABOUT]}
            overlayContent={overlayContent}
        >
            <View style={[styles.flex1]}>
                <View style={[styles.settingsPageBody, styles.mb6, styles.alignItemsCenter, styles.ph5]}>
                    <Text style={[styles.baseFontStyle]}>{props.translate('initialSettingsPage.aboutPage.description')}</Text>
                </View>
                {_.map(menuItems, (item) => (
                    <MenuItem
                        key={item.translationKey}
                        title={props.translate(item.translationKey)}
                        icon={item.icon}
                        iconRight={item.iconRight}
                        onPress={() => item.action()}
                        shouldBlockSelection={Boolean(item.link)}
                        onSecondaryInteraction={!_.isEmpty(item.link) ? (e) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, item.link, popoverAnchor) : undefined}
                        ref={(el) => (popoverAnchor = el)}
                        shouldShowRightIcon
                    />
                ))}
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
        </IllustratedHeaderPageLayout>
    );
}

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default compose(withLocalize, withWindowDimensions)(AboutPage);
