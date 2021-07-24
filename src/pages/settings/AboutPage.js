import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView, Linking} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import {
    Link,
    Eye,
    MoneyBag,
    Bug,
    NewWindow,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/new-expensify.svg';
import {version} from '../../../package.json';
import {fetchOrCreateChatReport} from '../../libs/actions/Report';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /** Onyx Props */

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user email */
        email: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const AboutPage = ({translate, session}) => {
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
            iconRight: NewWindow,
            action: () => {
                Linking.openURL(CONST.GITHUB_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
            icon: MoneyBag,
            iconRight: NewWindow,
            action: () => {
                Linking.openURL(CONST.UPWORK_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.reportABug',
            icon: Bug,
            action: () => {
                fetchOrCreateChatReport([session.email, CONST.EMAIL.CONCIERGE], true);
            },
        },
    ];

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={translate('initialSettingsPage.about')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView
                bounces={false}
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.mb6]}>
                            <Logo height={80} width={80} />
                            <Text
                                style={[
                                    styles.textLabel,
                                    styles.alignSelfCenter,
                                    styles.mt6,
                                    styles.mb2,
                                    styles.colorMuted,
                                ]}
                            >
                                v
                                {version}
                            </Text>
                            <Text style={[styles.textLabel, styles.mv5]}>
                                {translate('initialSettingsPage.aboutPage.description')}
                            </Text>
                        </View>
                    </View>
                    {menuItems.map(item => (
                        <MenuItem
                            key={item.translationKey}
                            title={translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    ))}
                </View>
                <View style={[styles.sidebarFooter]}>
                    <Text
                        style={[styles.chatItemMessageHeaderTimestamp]}
                        numberOfLines={1}
                    >
                        {translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase1',
                        )}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => Linking.openURL(CONST.TERMS_URL)}
                        >
                            {translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase2',
                            )}
                        </Text>
                        {' '}
                        {translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase3',
                        )}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => Linking.openURL(CONST.PRIVACY_URL)}
                        >
                            {translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase4',
                            )}
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: () => ONYXKEYS.SESSION,
        },
    }),
)(AboutPage);
