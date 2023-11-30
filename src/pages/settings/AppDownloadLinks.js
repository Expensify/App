import React from 'react';
import {ScrollView} from 'react-native';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import {CONTEXT_MENU_TYPES} from '@pages/home/report/ContextMenu/ContextMenuActions';
import * as ReportActionContextMenu from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import useThemeStyles from '@styles/useThemeStyles';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

function AppDownloadLinksPage(props) {
    const styles = useThemeStyles();
    let popoverAnchor;

    const menuItems = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            icon: Expensicons.Android,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
            },
            link: CONST.APP_DOWNLOAD_LINKS.ANDROID,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            icon: Expensicons.Apple,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS, true);
            },
            link: CONST.APP_DOWNLOAD_LINKS.IOS,
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.desktop.label',
            icon: Expensicons.Monitor,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.DESKTOP);
            },
            link: CONST.APP_DOWNLOAD_LINKS.DESKTOP,
        },
    ];

    return (
        <ScreenWrapper testID={AppDownloadLinksPage.displayName}>
            <HeaderWithBackButton
                title={props.translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_ABOUT)}
            />
            <ScrollView style={[styles.mt3]}>
                {_.map(menuItems, (item) => (
                    <MenuItem
                        key={item.translationKey}
                        onPress={() => item.action()}
                        onSecondaryInteraction={(e) => ReportActionContextMenu.showContextMenu(CONTEXT_MENU_TYPES.LINK, e, item.link, popoverAnchor)}
                        onKeyDown={(event) => {
                            event.target.blur();
                        }}
                        ref={(el) => (popoverAnchor = el)}
                        title={props.translate(item.translationKey)}
                        icon={item.icon}
                        iconRight={item.iconRight}
                        shouldBlockSelection
                        shouldShowRightIcon
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
}

AppDownloadLinksPage.propTypes = propTypes;
AppDownloadLinksPage.displayName = 'AppDownloadLinksPage';

export default compose(withWindowDimensions, withLocalize)(AppDownloadLinksPage);
