import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles, {getSafeAreaMargins} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import ChatSwitcherView from './ChatSwitcherView';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import {withRouter} from '../../../libs/Router';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';
import Icon from '../../../components/Icon';
import {MagnifyingGlass} from '../../../components/Icon/Expensicons';
import Header from '../../../components/Header';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import OptionsList from '../../../components/OptionsList';
import {getSidebarOptions} from '../../../libs/OptionsListUtils';
import {getDefaultAvatar} from '../../../libs/actions/PersonalDetails';

const propTypes = {
    // Toggles the navigation menu open and closed
    onLinkClick: PropTypes.func.isRequired,

    // navigates to settings and hides sidebar
    onAvatarClick: PropTypes.func.isRequired,

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
    draftComments: PropTypes.objectOf(PropTypes.string),

    // Current state of the chat switcher (active of inactive)
    isChatSwitcherActive: PropTypes.bool,

    // List of users' personal details
    personalDetails: PropTypes.objectOf(PropTypes.shape({
        login: PropTypes.string.isRequired,
        avatarURL: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
    })),

    // The personal details of the person who is logged in
    myPersonalDetails: PropTypes.shape({
        // Display name of the current user from their personal details
        displayName: PropTypes.string,

        // Avatar URL of the current user from their personal details
        avatarURL: PropTypes.string,
    }),

    // Information about the network
    network: PropTypes.shape({
        // Is the network currently offline or not
        isOffline: PropTypes.bool,
    }),

    // Currently viewed reportID
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    reports: {},
    isChatSwitcherActive: false,
    draftComments: {},
    personalDetails: {},
    myPersonalDetails: {
        avatarURL: getDefaultAvatar(),
    },
    network: null,
    currentlyViewedReportID: '',
};

const SidebarLinks = (props) => {
    const activeReportID = parseInt(props.currentlyViewedReportID, 10);

    const chatSwitcherStyle = props.isChatSwitcherActive
        ? [styles.sidebarHeader, styles.sidebarHeaderActive]
        : [styles.sidebarHeader];

    const {recentReports} = getSidebarOptions(
        props.reports,
        props.personalDetails,
        props.draftComments,
        activeReportID,
    );

    const sections = [{
        title: '',
        indexOffset: 0,
        data: recentReports,
        shouldShow: true,
    }];
    return (
        <View style={[styles.flex1, styles.h100, {marginTop: props.insets.top}]}>
            <View style={[chatSwitcherStyle]}>
                {props.isChatSwitcherActive && (
                    <ChatSwitcherView
                        onLinkClick={props.onLinkClick}
                    />
                )}
            </View>
            {!props.isChatSwitcherActive && (
                <>
                    <View style={[
                        styles.flexRow,
                        styles.sidebarHeaderTop,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    >
                        <Header textSize="large" title="Chats" />
                        <TouchableOpacity
                            style={[styles.flexRow, styles.sidebarHeaderTop]}
                            onPress={() => ChatSwitcher.show()}
                        >
                            <Icon src={MagnifyingGlass} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={props.onAvatarClick}
                        >
                            <AvatarWithIndicator
                                source={props.myPersonalDetails.avatarURL}
                                isActive={props.network && !props.network.isOffline}
                            />
                        </TouchableOpacity>
                    </View>
                    <OptionsList
                        contentContainerStyles={[
                            styles.sidebarListContainer,
                            {paddingBottom: getSafeAreaMargins(props.insets).marginBottom},
                        ]}
                        sections={sections}
                        focusedIndex={_.findIndex(recentReports, (
                            option => option.reportID === activeReportID
                        ))}
                        onSelectRow={(option) => {
                            redirect(ROUTES.getReportRoute(option.reportID));
                            props.onLinkClick();
                        }}
                        hideSectionHeaders
                    />
                </>
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
        draftComments: {
            key: ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT,
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
        isChatSwitcherActive: {
            key: ONYXKEYS.IS_CHAT_SWITCHER_ACTIVE,
            initWithStoredValues: false,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(SidebarLinks);
