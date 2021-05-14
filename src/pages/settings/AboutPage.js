import React from 'react';
import {View} from 'react-native';

import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import {
    Link, Eye, MoneyBag, Bug,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {
    withLocalizePropTypes,
} from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/expensify-cash.svg';
import {version} from '../../../package.json';
import openURLInNewTab from '../../libs/openURLInNewTab';

const menuItems = [
    {
        translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
        icon: Link,
        action: () => {
            Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS);
        },
    },
    {
        translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
        icon: Eye,
        action: () => {
            openURLInNewTab(CONST.GITHUB_URL);
        },
    },
    {
        translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
        icon: MoneyBag,
        action: () => {
            openURLInNewTab(CONST.UPWORK_URL);
        },
    },
    {
        translationKey: 'initialSettingsPage.aboutPage.reportABug',
        icon: Bug,
        action: () => {
            // TODO
            openURLInNewTab('https://expensify.cash/');
        },
    },

];

const propTypes = {

    ...withLocalizePropTypes,
};

const defaultProps = {

};

const AboutPage = ({translate}) => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={translate('initialSettingsPage.about')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <View style={styles.pageWrapper}>
            <View style={[styles.settingsPageBody, styles.mb6]}>
                <Logo height={100} />
                <Text style={[styles.textLabel, styles.alignSelfCenter, {marginVertical: 10}]}>
                    v
                    {version}
                </Text>
                <Text style={[styles.textLabel, styles.textP, {marginVertical: 20}]}>
                    Expensify.cash is built by a community of open source developers
                    from around the world. Come help us build the next generation of
                    Expensify.
                </Text>

            </View>
        </View>
        {menuItems.map(item => (
            <MenuItem
                key={item.title}
                title={translate(item.translationKey)}
                icon={item.icon}
                onPress={() => item.action()}
                shouldShowRightArrow
            />
        ))}
        <View style={[styles.sidebarFooter, {position: 'absolute', bottom: 0}]}>
            <Text
                style={[styles.chatItemMessageHeaderTimestamp]}
                numberOfLines={1}
            >
                {translate(
                    'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase1',
                )}
                <Text
                    style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                    onPress={() => openURLInNewTab(CONST.TERMS_URL)}
                >
                    {translate(
                        'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase2',
                    )}
                </Text>
                {translate(
                    'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase3',
                )}
                <Text
                    style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                    onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
                >
                    {translate(
                        'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase4',
                    )}
                    {translate(
                        'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase5',
                    )}
                </Text>
            </Text>
        </View>
    </ScreenWrapper>
);

AboutPage.propTypes = propTypes;
AboutPage.defaultProps = defaultProps;
AboutPage.displayName = 'PreferencesPage';

export default compose(
    withLocalize,

)(AboutPage);
