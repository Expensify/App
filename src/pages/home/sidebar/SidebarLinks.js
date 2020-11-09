import React from 'react';
import {View, ScrollView} from 'react-native';
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

    isChatSwitcherActive: PropTypes.bool,
};
const defaultProps = {
    reports: {},
    isChatSwitcherActive: false,
};

const SidebarLinks = (props) => {
    const {onLinkClick} = props;
    const reportIDInUrl = parseInt(props.match.params.reportID, 10);
    const sortedReports = lodashOrderby(props.reports, [
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
    const sidebarLinksStyle = !props.isChatSwitcherActive
        ? [styles.sidebarListContainer]
        : [styles.sidebarListContainer, styles.dNone];
    return (
        <View style={[styles.flex1, {marginTop: props.insets.top}]}>
            <View style={[styles.sidebarHeader]}>
                <ChatSwitcherView
                    onLinkClick={onLinkClick}
                    isChatSwitcherActive={props.isChatSwitcherActive}
                />
            </View>
            <ScrollView
                style={sidebarLinksStyle}
                bounces={false}
                indicatorStyle="white"
                stickyHeaderIndices={[0]}
            >
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
            </ScrollView>
        </View>
    );
};

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;
SidebarLinks.displayName = 'SidebarLinks';

export default compose(
    withRouter,
    withIon({
        reports: {
            key: IONKEYS.COLLECTION.REPORT,
        },
    }),
)(SidebarLinks);
