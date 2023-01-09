import _ from 'underscore';
import React from 'react';
import {ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import styles from '../../styles/styles';
import * as Link from '../../libs/actions/Link';
import PressableWithSecondaryInteraction from '../../components/PressableWithSecondaryInteraction';
import ControlSelection from '../../libs/ControlSelection';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import * as ReportActionContextMenu from '../home/report/ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from '../home/report/ContextMenu/ContextMenuActions';
import PopoverReportActionContextMenu from '../home/report/ContextMenu/PopoverReportActionContextMenu';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const AppDownloadLinksPage = (props) => {
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

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {String} [selection] - Copied content.
     */
    const showPopover = (event, selection) => {
        ReportActionContextMenu.showContextMenu(
            ContextMenuActions.CONTEXT_MENU_TYPES.LINK,
            event,
            selection,
            popoverAnchor,
        );
    };

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.mt5]}>
                <PopoverReportActionContextMenu
                    ref={ReportActionContextMenu.contextMenuRef}
                />
                {_.map(menuItems, item => (
                    <PressableWithSecondaryInteraction
                        key={item.translationKey}
                        onPressIn={() => props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onSecondaryInteraction={e => showPopover(e, item.link)}
                        ref={el => popoverAnchor = el}
                        onKeyDown={(event) => {
                            event.target.blur();
                        }}
                    >
                        <MenuItem
                            title={props.translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    </PressableWithSecondaryInteraction>
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
};

AppDownloadLinksPage.propTypes = propTypes;
AppDownloadLinksPage.displayName = 'AppDownloadLinksPage';

export default compose(
    withWindowDimensions,
    withLocalize,
)(AppDownloadLinksPage);
