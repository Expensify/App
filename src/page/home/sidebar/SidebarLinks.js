import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashOrderby from 'lodash.orderby';
import styles from '../../../style/StyleSheet';
import Text from '../../../components/Text';
import SidebarLink from './SidebarLink';
import withIon from '../../../components/withIon';
import IONKEYS from '../../../IONKEYS';
import PageTitleUpdater from '../../../lib/PageTitleUpdater';
import ChatSwitcherView from './ChatSwitcherView';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../lib/compose';
import {withRouter} from '../../../lib/Router';
import {redirect} from '../../../lib/actions/App';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

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
        const reportIDInUrl = parseInt(this.props.match.params.reportID, 10);
        const sortedReports = lodashOrderby(this.props.reports, ['pinnedReport', 'reportName'], ['desc', 'asc']);

        // Filter the reports so that the only reports shown are pinned, unread, and the one matching the URL
        // eslint-disable-next-line max-len
        const reportsToDisplay = _.filter(sortedReports, report => (report.pinnedReport || report.hasUnread || report.reportID === reportIDInUrl));

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
                        {/* A report will not have a report name if it hasn't been fetched from the server yet */}
                        {/* so nothing is rendered */}
                        {_.map(reportsToDisplay, report => report.reportName && (
                            <SidebarLink
                                key={report.reportID}
                                reportID={report.reportID}
                                reportName={report.reportName}
                                hasUnread={report.hasUnread}
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

export default compose(
    withRouter,
    withIon({
        reports: {
            key: `${IONKEYS.REPORT}_[0-9]+$`,
        }
    }),
)(SidebarLinks);
