import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'lodash';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import {
    Link, Eye, MoneyBag, Bug, NewWindow,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/expensify-cash.svg';
import {version} from '../../../package.json';
import openURLInNewTab from '../../libs/openURLInNewTab';
import ONYXKEYS from '../../ONYXKEYS';


const propTypes = {
    // All reports shared with the user
    reports: PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {

};

const AboutPage = ({translate, reports}) => {
    const [reportID, setreportID] = useState(null);
    useEffect(() => {
        const reportKey = _.findKey(reports, ['reportName', CONST.CONCIERGE_CHAT_NAME]);
        if (reportKey) {
            const report = reports[reportKey];
            if (Array.isArray(report.participants)
                && report.participants.length === 1
                && report.participants[0] === CONST.EMAIL.CONCIERGE) {
                setreportID(reports[reportKey].reportID);
            }
        }
    }, [reports]);


    const menuItems = [
        {
            translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
            icon: Link,
            action: () => { Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS); },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
            icon: Eye,
            iconRight: NewWindow,
            action: () => { openURLInNewTab(CONST.GITHUB_URL); },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
            icon: MoneyBag,
            iconRight: NewWindow,
            action: () => { openURLInNewTab(CONST.UPWORK_URL); },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.reportABug',
            icon: Bug,
            action: () => { if (reportID) { Navigation.navigate(ROUTES.getReportRoute(reportID)); } },
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
                contentContainerStyle={[styles.flexGrow1, styles.flexColumn, styles.justifyContentBetween]}
            >
                <View style={[styles.flex1]}>
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.mb6]}>
                            <Logo height={100} />
                            <Text style={[styles.textLabel, styles.alignSelfCenter, styles.mv2, styles.colorMuted]}>
                                v
                                {version}
                            </Text>
                            <Text style={[styles.textLabel, styles.textP, styles.mv5]}>
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
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightArrow
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
                            onPress={() => openURLInNewTab(CONST.TERMS_URL)}
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
                            onPress={() => openURLInNewTab(CONST.PRIVACY_URL)}
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
AboutPage.defaultProps = defaultProps;
AboutPage.displayName = 'PreferencesPage';

export default compose(
    withLocalize,
    withOnyx({
        reports: {
            key: () => `${ONYXKEYS.COLLECTION.REPORT}`,
        },
    }),
)(AboutPage);
