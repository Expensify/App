import React from 'react';
import {ScrollView, Linking} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import {
    Android, Apple, NewWindow, Monitor,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import styles from '../../styles/styles';

const propTypes = {
    ...withLocalizePropTypes,
};

const AppDownloadLinksPage = ({translate}) => {
    const menuItems = [
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.android.label',
            icon: Android,
            iconRight: NewWindow,
            action: () => { Linking.openURL(CONST.APP_DOWNLOAD_LINKS.ANDROID); },
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.ios.label',
            icon: Apple,
            iconRight: NewWindow,
            action: () => { Linking.openURL(CONST.APP_DOWNLOAD_LINKS.IOS); },
        },
        {
            translationKey: 'initialSettingsPage.appDownloadLinks.desktop.label',
            icon: Monitor,
            iconRight: NewWindow,
            action: () => { Linking.openURL(CONST.APP_DOWNLOAD_LINKS.DESKTOP); },
        },
    ];

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('initialSettingsPage.aboutPage.appDownloadLinks')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={[styles.mt5]} bounces={false}>
                {menuItems.map(item => (
                    <MenuItem
                        key={item.title}
                        title={translate(item.translationKey)}
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
AppDownloadLinksPage.displayName = 'PreferencesPage';

export default compose(
    withLocalize,
)(AppDownloadLinksPage);
