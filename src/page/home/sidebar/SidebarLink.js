import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import {withRouter} from '../../../lib/Router';
import IONKEYS from '../../../IONKEYS';
import styles from '../../../style/StyleSheet';
import withIon from '../../../components/withIon';
import PressableLink from '../../../components/PressableLink';
import compose from '../../../lib/compose';

const propTypes = {
    // The ID of the report for this link
    reportID: PropTypes.number.isRequired,

    // The name of the report to use as the text for this link
    reportName: PropTypes.string,

    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    /* Ion Props */

    // The report object for this link
    report: PropTypes.shape({
        // Does the report for this link have unread comments?
        isUnread: PropTypes.bool,
    }),
};

const defaultProps = {
    report: {
        isUnread: false,
    },
    reportName: '',
};

const SidebarLink = (props) => {
    const reportIDInUrl = parseInt(props.match.params.reportID, 10);
    const isReportActive = reportIDInUrl === props.reportID;
    const linkWrapperActiveStyle = isReportActive && styles.sidebarLinkWrapperActive;
    const linkActiveStyle = isReportActive ? styles.sidebarLinkActive : styles.sidebarLink;
    const textActiveStyle = isReportActive ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textActiveUnreadStyle = props.report.isUnread
        ? [textActiveStyle, styles.sidebarLinkTextUnread] : [textActiveStyle];

    return (
        <View style={[styles.sidebarListItem, linkWrapperActiveStyle]}>
            <PressableLink onClick={props.onLinkClick} to={`/${props.reportID}`} style={linkActiveStyle}>
                <View style={[styles.sidebarLinkInner]}>
                    <Text numberOfLines={1} style={textActiveUnreadStyle}>
                        {props.reportName}
                    </Text>
                </View>
            </PressableLink>
        </View>
    );
};

SidebarLink.displayName = 'SidebarLink';
SidebarLink.propTypes = propTypes;
SidebarLink.defaultProps = defaultProps;

export default compose(
    withRouter,
    withIon({
        report: {
            key: `${IONKEYS.COLLECTION.REPORT}%DATAFROMPROPS%`,
            pathForProps: 'reportID',
        }
    }),
)(SidebarLink);
