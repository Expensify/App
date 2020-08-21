import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import Text from '../../../components/Text';
import SidebarLink from './SidebarLink';
import WithIon from '../../../components/WithIon';
import IONKEYS from '../../../IONKEYS';
import {fetchAll} from '../../../lib/actions/ActionsReport';
import Ion from '../../../lib/Ion';
import PageTitleUpdater from '../../../lib/PageTitleUpdater/index.native';
import ChatSwitcherView from './ChatSwitcherView';

const propTypes = {
    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    /* Ion Props */

    // List of reports
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
        hasUnread: PropTypes.bool,
    })),
};
const defaultProps = {
    reports: {},
};

const SidebarLinks = ({reports, onLinkClick}) => {
    // Updates the page title to indicate there are unread reports
    PageTitleUpdater(_.any(reports, report => report.hasUnread));

    return (
        <View style={[styles.sidebarListContainer]}>
            <ChatSwitcherView />
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
                    onLinkClick={onLinkClick}
                />
            ))}
        </View>
    );
};

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;
SidebarLinks.displayName = 'SidebarLinks';

export default WithIon({
    reports: {
        key: `${IONKEYS.REPORT}_[0-9]+$`,
        addAsCollection: true,
        collectionID: 'reportID',
        loader: () => fetchAll().then(() => {
            // After the reports are loaded for the first time, redirect to the first reportID in the list
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
})(SidebarLinks);
