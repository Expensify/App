import React from 'react';
import _ from 'underscore';
import {
    View,
    Image
} from 'react-native';
import Text from '../../components/Text';
import {signOut} from '../../lib/actions/ActionsSession';
import {fetch as getPersonalDetails} from '../../lib/actions/ActionsPersonalDetails';
import styles from '../../style/StyleSheet';
import WithIon from '../../components/WithIon';
import IONKEYS from '../../IONKEYS';
import {fetchAll} from '../../lib/actions/ActionsReport';
import SidebarLink from './SidebarLink';
import logo from '../../../assets/images/expensify-logo_reversed.png';
import PageTitleUpdater from '../../lib/PageTitleUpdater';
import Ion from '../../lib/Ion';

class SidebarView extends React.Component {
    /**
     * Updates the page title to indicate there are unread reports
     */
    updateUnreadReportIndicator() {
        if (this.state) {
            const hasUnreadReports = _.any(this.state.reports, report => report.hasUnread);
            PageTitleUpdater(hasUnreadReports);
        }
    }

    render() {
        const reports = this.state && this.state.reports;
        this.updateUnreadReportIndicator();
        return (
            <View style={[styles.flex1, styles.sidebar]}>
                <View style={[styles.sidebarHeader]}>
                    <Image
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
                        <SidebarLink key={report.reportID} reportID={report.reportID} reportName={report.reportName} />
                    ))}
                </View>
                <View style={[styles.sidebarFooter]}>
                    <View style={[styles.sidebarFooterAvatar]}>
                        <Image
                            source={{uri: this.state && this.state.avatarURL}}
                            style={[styles.historyItemAvatar]}
                        />
                    </View>
                    <View style={[styles.flexColumn]}>
                        {this.state && this.state.userDisplayName && (
                            <Text style={[styles.sidebarFooterUsername]}>
                                {this.state.userDisplayName}
                            </Text>
                        )}
                        <Text style={[styles.sidebarFooterLink]} onPress={signOut}>Sign Out</Text>
                    </View>
                </View>
            </View>
        );
    }
}

export default WithIon({
    // Map this.state.userDisplayName to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    userDisplayName: {
        key: IONKEYS.MY_PERSONAL_DETAILS,
        path: 'displayName',
        loader: getPersonalDetails,
        prefillWithKey: IONKEYS.MY_PERSONAL_DETAILS,
    },
    avatarURL: {
        key: IONKEYS.MY_PERSONAL_DETAILS,
        path: 'avatarURL',
        loader: getPersonalDetails,
        prefillWithKey: IONKEYS.MY_PERSONAL_DETAILS,
    },
    reports: {
        key: `${IONKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionId: 'reportID',
        loader: () => fetchAll().then((data) => {
            // If we're on the home page, then redirect to the first report ID
            if (window.location.pathname === '/' && data.length) {
                Ion.set(IONKEYS.APP_REDIRECT_TO, `/${data[0].reportID}`);
            }
        }),
    },
})(SidebarView);
