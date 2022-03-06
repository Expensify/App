import _ from 'underscore';
import React from 'react';
import {ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import styles from '../../styles/styles';
import * as Link from '../../libs/actions/Link';
import getOperatingSystem from '../../libs/getOperatingSystem';
import Log from '../../libs/Log';

const propTypes = {
    ...withLocalizePropTypes,
};

// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

const AppDownloadLinksPage = (props) => {
    const menuItems = [
        {
            title: props.translate('initialSettingsPage.appDownloadLinks.android.label'),
            icon: Expensicons.Android,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID);
            },
        },
        {
            title: props.translate('initialSettingsPage.appDownloadLinks.ios.label'),
            icon: Expensicons.Apple,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS);
            },
        },
        {
            title: `${getOperatingSystem()} ${deferredPrompt
                ? ''
                : props.translate('initialSettingsPage.appDownloadLinks.desktop.alreadyInstalled')}`,
            icon: Expensicons.Monitor,
            iconRight: Expensicons.Plus,
            disabled: !deferredPrompt,
            action: () => {
                if (!deferredPrompt) {
                    return;
                }

                // Show the installation prompt
                deferredPrompt.prompt();

                deferredPrompt.userChoice.then(({outcome}) => {
                    Log.info('[PWA] User response to the install prompt', false, outcome);
                });

                // We've used the prompt, and can't use it again, throw it away
                deferredPrompt = null;
            },
        },
    ];

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.mt5]}>
                {_.map(menuItems, item => (
                    <MenuItem
                        key={item.title}
                        title={item.title}
                        icon={item.icon}
                        iconRight={item.iconRight}
                        disabled={item.disabled}
                        onPress={() => item.action()}
                        shouldShowRightIcon
                    />
                ))}
            </ScrollView>
        </ScreenWrapper>
    );
};

AppDownloadLinksPage.propTypes = propTypes;
AppDownloadLinksPage.displayName = 'AppDownloadLinksPage';

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    Log.info('[PWA] beforeinstallprompt event was fired');
});

export default withLocalize(AppDownloadLinksPage);
