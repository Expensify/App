import React from 'react';
import PropTypes from 'prop-types';
import {Image, View} from 'react-native';
import _ from 'underscore';
import Text from '../../../components/Text';
import styles from '../../../styles/StyleSheet';
import PressableLink from '../../../components/PressableLink';
import ROUTES from '../../../ROUTES';

const propTypes = {
    // The ID of the report for this link
    reportID: PropTypes.number.isRequired,

    // The name of the report to use as the text for this link
    reportName: PropTypes.string,

    // The icon for the report
    icon: PropTypes.string,

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
    icon: '',
};

const SidebarLink = (props) => {
    const linkWrapperActiveStyle = props.isActiveReport && styles.sidebarLinkWrapperActive;
    const linkActiveStyle = props.isActiveReport ? styles.sidebarLinkActive : null;
    const textActiveStyle = props.isActiveReport ? styles.sidebarLinkActiveText : styles.sidebarLinkText;
    const textActiveUnreadStyle = props.isUnread
        ? [textActiveStyle, styles.sidebarLinkTextUnread] : [textActiveStyle];

    return (
        <View style={[styles.sidebarListItem, linkWrapperActiveStyle]}>
            <View style={[linkActiveStyle, styles.sidebarLink]}>
                <PressableLink
                    onClick={props.onLinkClick}
                    to={ROUTES.getReportRoute(props.reportID)}
                    style={styles.textDecorationNoLine}
                >
                    <View style={[styles.sidebarLinkInner]}>
                        {!_.isEmpty(props.icon) && (
                            <View style={[styles.chatSwitcherAvatar, styles.mr2]}>
                                <Image
                                    source={{uri: props.icon}}
                                    style={[styles.chatSwitcherAvatarImage]}
                                />
                            </View>
                        )}
                        <Text numberOfLines={1} style={textActiveUnreadStyle}>
                            {props.reportName}
                        </Text>
                    </View>
                </PressableLink>
            </View>
        </View>
    );
};

SidebarLink.displayName = 'SidebarLink';
SidebarLink.propTypes = propTypes;
SidebarLink.defaultProps = defaultProps;

export default SidebarLink;
