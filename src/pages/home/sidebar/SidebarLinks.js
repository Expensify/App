import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import ChatSelector from '../../../components/ChatSelector';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import {withRouter} from '../../../libs/Router';
import ChatSectionList from '../../../components/ChatSectionList';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import {getChatListOptions} from '../../../libs/ChatSearchUtils';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    // Toggles the hamburger menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // Safe area insets required for mobile devices margins
    insets: SafeAreaInsetPropTypes.isRequired,

    /* Onyx Props */

    // List of reports
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
        reportName: PropTypes.string,
        unreadActionCount: PropTypes.number,
    })),

    // List of draft comments. We don't know the shape, since the keys include the report numbers
    comments: PropTypes.objectOf(PropTypes.string),

    isChatSwitcherActive: PropTypes.bool,

    // List of users' personal details
    personalDetails: PropTypes.objectOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        avatarURL: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    })),
};

const defaultProps = {
    reports: {},
    isChatSwitcherActive: false,
    comments: {},
    personalDetails: {},
};

const SidebarLinks = (props) => {
    const reportIDInUrl = parseInt(props.match.params.reportID, 10);
    const chatSwitcherStyle = props.isChatSwitcherActive
        ? [styles.sidebarHeader, styles.sidebarHeaderActive]
        : [styles.sidebarHeader];

    const {recentChats} = getChatListOptions(
        props.personalDetails,
        props.reports,
        props.comments,
        {
            includeRecentChats: true,
            numberOfRecentChatsToShow: 50,
            showPinnedChatsOnTop: true,
        }
    );

    const sections = [{
        title: '',
        indexOffset: 0,
        data: recentChats,
        shouldShow: true,
    }];

    return (
        <View style={[styles.flex1, styles.height100percent, {marginTop: props.insets.top}]}>
            <View style={[chatSwitcherStyle]}>
                {props.isChatSwitcherActive && (
                    <>
                        <HeaderWithCloseButton
                            title="Search"
                            onCloseButtonPress={() => ChatSwitcher.hide()}
                        />
                        <ChatSelector
                            placeholderText="Find a chat"
                            hideSectionHeaders
                            showRecentChats
                            includeGroupChats
                            numberOfRecentChatsToShow={50}
                            onSelectRow={props.onLinkClick}
                        />
                    </>
                )}
            </View>
            {!props.isChatSwitcherActive && (
                <ChatSectionList
                    contentContainerStyles={[styles.sidebarListContainer]}
                    sections={sections}
                    focusedIndex={_.indexOf(recentChats, option => option.reportID === reportIDInUrl)}
                    onSelectRow={(option) => {
                        redirect(ROUTES.getReportRoute(option.reportID));
                        props.onLinkClick();
                    }}
                    hideSectionHeaders
                />
            )}
        </View>
    );
};

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;
SidebarLinks.displayName = 'SidebarLinks';

export default compose(
    withRouter,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        comments: {
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
    }),
)(SidebarLinks);
