import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashOrderby from 'lodash.orderby';
import styles from '../../../styles/StyleSheet';
import Text from '../../../components/Text';
import SidebarLink from './SidebarLink';
import withIon from '../../../components/withIon';
import IONKEYS from '../../../IONKEYS';
import ChatSwitcherView from './ChatSwitcherView';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import {withRouter} from '../../../libs/Router';

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
        unreadActionCount: PropTypes.number,
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
        const {onLinkClick} = this.props;
        const reportIDInUrl = parseInt(this.props.match.params.reportID, 10);
        const sortedReports = lodashOrderby(this.props.reports, [
            'isPinned',
            'reportName'
        ], [
            'desc',
            'asc'
        ]);

        // Filter the reports so that the only reports shown are pinned, unread, and the one matching the URL
        // eslint-disable-next-line max-len
        const reportsToDisplay = _.filter(sortedReports, report => (report.isPinned || (report.unreadActionCount > 0) || report.reportID === reportIDInUrl));

        // Update styles to hide the report links if they should not be visible
        const sidebarLinksStyle = this.state.areReportLinksVisible
            ? [styles.sidebarListContainer]
            : [styles.sidebarListContainer, styles.dNone];

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
                        onLinkClick={onLinkClick}
                    />
                </View>
                <View style={sidebarLinksStyle}>
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
                            isUnread={report.unreadActionCount > 0}
                            onLinkClick={onLinkClick}
                            isActiveReport={report.reportID === reportIDInUrl}
                            isPinned={report.isPinned}
                        />
                    ))}
                </View>
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
            key: IONKEYS.COLLECTION.REPORT,
        }
    }),
)(SidebarLinks);
