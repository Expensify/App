import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../styles/StyleSheet';
import PressableLink from '../../../components/PressableLink';
import ROUTES from '../../../ROUTES';

const propTypes = {
    // The ID of the report for this link
    reportID: PropTypes.number.isRequired,

    // The name of the report to use as the text for this link
    reportName: PropTypes.string,

    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Does the report for this link have unread comments?
    isUnread: PropTypes.bool,

    // Whether this is the report currently in view
    isActiveReport: PropTypes.bool.isRequired,
};

const defaultProps = {
    isUnread: false,
    reportName: '',
};

const SidebarLink = (props) => {
    const linkWrapperActiveStyle = props.isActiveReport && styles.sidebarLinkWrapperActive;
    const linkActiveStyle = props.isActiveReport ? styles.sidebarLinkActive : styles.sidebarLink;
    const textActiveStyle = props.isActiveReport ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textActiveUnreadStyle = props.isUnread
        ? [textActiveStyle, styles.sidebarLinkTextUnread] : [textActiveStyle];

    return (
        <View style={[styles.sidebarListItem, linkWrapperActiveStyle]}>
            <PressableLink
                onClick={props.onLinkClick}
                to={ROUTES.getReportRoute(props.reportID)}
                style={linkActiveStyle}
            >
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

export default SidebarLink;
