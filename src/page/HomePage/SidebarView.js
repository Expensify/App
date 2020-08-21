import React from 'react';
import _ from 'underscore';
import {
    View,
    Image,
    Linking
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../../components/Text';
import {signOut} from '../../lib/actions/ActionsSession';
import {fetch as getPersonalDetails} from '../../lib/actions/ActionsPersonalDetails';
import styles, {getSafeAreaMargins} from '../../style/StyleSheet';
import WithIon from '../../components/WithIon';
import IONKEYS from '../../IONKEYS';
import {fetchAll} from '../../lib/actions/ActionsReport';
import SidebarLink from './SidebarLink';
import logo from '../../../assets/images/expensify-logo_reversed.png';
import PageTitleUpdater from '../../lib/PageTitleUpdater';
import Ion from '../../lib/Ion';
import Anchor from '../../components/Anchor';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    // eslint-disable-next-line react/forbid-prop-types
    insets: PropTypes.object.isRequired,

    /* Ion Props */

    // Display name of the current user from their personal details
    userDisplayName: PropTypes.string,

    // Avatar URL of the current user from their personal details
    avatarURL: PropTypes.string,

    // List of reports
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
        hasUnread: PropTypes.bool,
    })),

    // Is this person offline?
    isOffline: PropTypes.bool,
};

const defaultProps = {
    userDisplayName: null,
    avatarURL: '',
    reports: {},
    isOffline: false,
};

class SidebarView extends React.Component {
    /**
     * Updates the page title to indicate there are unread reports
     */
    updateUnreadReportIndicator() {
        const hasUnreadReports = _.any(this.props.reports, report => report.hasUnread);
        PageTitleUpdater(hasUnreadReports);
    }

    alertInstallInstructions() {
        alert('To install Chat Desktop App:\n\n'
            + '1. Double click "Chat.app.zip"\n'
            + '2. If you get a "Cannot be opened because the developer cannot be verified" error:\n'
            + '    1. Hit Cancel\n'
            + '    2. Go to System Preferences > Security & Privacy > General\n'
            + '    3. Click Open Anyway at the bottom\n'
            + '    4. When it re-prompts you, click Open');
        Linking.openURL('https://chat.expensify.com/Chat.app.zip');
    }

    render() {
        const reports = this.props.reports;
        this.updateUnreadReportIndicator();
        return (
            <View style={[styles.flex1, styles.sidebar]}>
                <View style={[styles.sidebarHeader, {marginTop: this.props.insets.top}]}>
                    <Image
                        resizeMode="contain"
                        style={[styles.sidebarHeaderLogo]}
                        source={logo}
                    />
                </View>
                <View style={[styles.sidebarListContainer]}>
                    <View style={[styles.sidebarListItem]}>
                        <Text style={[styles.sidebarListHeader]}>
                            Chats
                        </Text>
                    </View>
                    {_.map(reports, report => (
                        <SidebarLink
                            key={report.reportID}
                            reportID={report.reportID}
                            reportName={report.reportName}
                            onLinkClick={this.props.onLinkClick}
                        />
                    ))}
                </View>
                <View style={[styles.sidebarFooter, getSafeAreaMargins(this.props.insets)]}>
                    <View style={[styles.sidebarFooterAvatar]}>
                        <Image
                            source={{uri: this.props.avatarURL}}
                            style={[styles.historyItemAvatar]}
                        />
                        {this.props.isOffline && (
                        <View style={[styles.statusIndicator]} />
                        )}
                    </View>
                    <View style={[styles.flexColumn]}>
                        {this.props.userDisplayName && (
                            <Text style={[styles.sidebarFooterUsername]}>
                                {this.props.userDisplayName}
                            </Text>
                        )}
                        <View style={[styles.flexRow]}>
                            <Text
                                style={[styles.sidebarFooterLink, styles.mr2]}
                                onPress={() => this.alertInstallInstructions()}
                            >
                                Desktop
                            </Text>
                            <Anchor
                                style={[styles.sidebarFooterLink, styles.mr2]}
                                href="https://testflight.apple.com/join/vBYbMRQG"
                            >
                                iOS
                            </Anchor>
                            <Anchor
                                style={[styles.sidebarFooterLink, styles.mr2]}
                                href="https://chat.expensify.com/app-release.apk"
                            >
                                Android
                            </Anchor>
                            <Text style={[styles.sidebarFooterLink]} onPress={signOut}>Sign Out</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

SidebarView.propTypes = propTypes;
SidebarView.defaultProps = defaultProps;

export default WithIon({
    // Map this.props.userDisplayName to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    userDisplayName: {
        key: IONKEYS.MY_PERSONAL_DETAILS,
        path: 'displayName',
        loader: getPersonalDetails,
    },
    avatarURL: {
        key: IONKEYS.MY_PERSONAL_DETAILS,
        path: 'avatarURL',
        loader: getPersonalDetails,
    },
    reports: {
        key: `${IONKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionID: 'reportID',
        loader: () => fetchAll().then(() => {
            Ion.multiGet([IONKEYS.CURRENT_URL, IONKEYS.FIRST_REPORT_ID]).then((values) => {
                const currentURL = values[IONKEYS.CURRENT_URL] || '';
                const firstReportID = values[IONKEYS.FIRST_REPORT_ID] || 0;

                // If we're on the home page, then redirect to the first report ID
                if (currentURL === '/' && firstReportID) {
                    Ion.set(IONKEYS.APP_REDIRECT_TO, `/${firstReportID}`);
                }
            });
        }),
    },
    isOffline: {
        key: IONKEYS.NETWORK,
        path: 'isOffline',
        defaultValue: false,
    },
})(SidebarView);
