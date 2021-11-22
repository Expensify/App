import _ from 'underscore';
import React from 'react';
import {ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import {
    Android, Apple, NewWindow, Monitor,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import styles from '../../styles/styles';
import {openExternalLink} from '../../libs/actions/Link';

const propTypes = {
    ...withLocalizePropTypes,
};

const AppDownloadLinksPage = (props) => {
    const menuItems = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            icon: Android,
            iconRight: NewWindow,
            action: () => { openExternalLink(CONST.APP_DOWNLOAD_LINKS.ANDROID); },
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            icon: Apple,
            iconRight: NewWindow,
            action: () => { openExternalLink(CONST.APP_DOWNLOAD_LINKS.IOS); },
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.desktop.label',
            icon: Monitor,
            iconRight: NewWindow,
            action: () => { openExternalLink(CONST.APP_DOWNLOAD_LINKS.DESKTOP); },
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
                        key={item.translationKey}
                        title={props.translate(item.translationKey)}
                        icon={item.icon}
                        iconRight={item.iconRight}
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

export default withLocalize(AppDownloadLinksPage);
