import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import styles from '../../../style/StyleSheet';
import Text from '../../../components/Text';
import SidebarLink from './SidebarLink';
import withIon from '../../../components/withIon';
import IONKEYS from '../../../IONKEYS';
import {fetchAll, fetchChatReports} from '../../../lib/actions/Report';
import Ion from '../../../lib/Ion';
import PageTitleUpdater from '../../../lib/PageTitleUpdater/index.native';
import ChatSwitcherView from './ChatSwitcherView';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';

const propTypes = {
    // A function to call when the chat switcher is blurred
    onChatSwitcherBlur: PropTypes.func.isRequired,

    // A function to call when the chat switcher gets focus
    onChatSwitcherFocus: PropTypes.func.isRequired,

    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

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

class SidebarLinks extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            areReportLinksVisible: true,
        };
    }

    render() {
        const {reports, onLinkClick} = this.props;

        // Updates the page title to indicate there are unread reports
        PageTitleUpdater(_.any(reports, report => report.hasUnread));

        return (
            <View style={[styles.flex1, {marginTop: this.props.insets.top}]}>
                <View style={[styles.sidebarHeader]}>
                    <ChatSwitcherView
                        onBlur={() => {
                            this.setState({areReportLinksVisible: true});
                            this.props.onChatSwitcherBlur();
                        }}
                        onFocus={() => {
                            this.setState({areReportLinksVisible: false});
                            this.props.onChatSwitcherFocus();
                        }}
                    />
                </View>

                {this.state.areReportLinksVisible && (
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
                                onLinkClick={onLinkClick}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

export default withIon({
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

            fetchChatReports();
        }),
    },
})(SidebarLinks);
