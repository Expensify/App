import React from 'react';
import _ from 'underscore';
import {Button, Text, View, Image} from 'react-native';
import {signOut} from '../../lib/actions/ActionsSession';
import {fetch as getPersonalDetails} from '../../lib/actions/ActionsPersonalDetails';
import styles from '../../style/StyleSheet';
import WithStore from '../../components/WithStore';
import STOREKEYS from '../../store/STOREKEYS';
import {fetchAll} from '../../lib/actions/ActionsReport';
import SidebarLink from './SidebarLink';
import logo from '../../images/expensify-logo_reversed.png';
import PageTitleUpdater from '../../lib/PageTitleUpdater';

class SidebarView extends React.Component {
    /**
     * Updates the page title to indicate there are unread reports
     */
    updateUnreadReportIndicator() {
        if (this.state) {
            const hasUnreadReports = _.any(this.state.individualReports, report => report.hasUnread);
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
                    {this.state && this.state.userDisplayName && (
                        <Text style={[styles.sidebarFooterUsername]}>
                            {this.state.userDisplayName}
                        </Text>
                    )}
                    <Button onPress={signOut} title="Sign Out" />
                </View>
            </View>
        );
    }
}

export default WithStore({
    // Map this.state.userDisplayName to the personal details key in the store and bind it to the displayName property
    // and load it with data from getPersonalDetails()
    userDisplayName: {
        key: STOREKEYS.MY_PERSONAL_DETAILS,
        path: 'displayName',
        loader: getPersonalDetails,
        prefillWithKey: STOREKEYS.MY_PERSONAL_DETAILS,
    },
    reports: {
        key: STOREKEYS.REPORTS,
        loader: fetchAll,
        prefillWithKey: STOREKEYS.REPORTS,
    },
    individualReports: {
        key: `${STOREKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionId: 'reportID',
    },
})(SidebarView);
