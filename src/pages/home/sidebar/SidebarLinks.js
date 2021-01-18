import React from 'react';
import {
    Animated,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import lodashOrderby from 'lodash.orderby';
import get from 'lodash.get';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import styles from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import ChatSwitcherView from './ChatSwitcherView';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import {withRouter} from '../../../libs/Router';
import ChatLinkRow from './ChatLinkRow';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';
import {MagnifyingGlassIcon} from '../../../components/Expensicons';
import Header from '../../../components/Header';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';

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
};

const defaultProps = {
    reports: {},
    isChatSwitcherActive: false,
    comments: {},
    personalDetails: {},
    myPersonalDetails: {},
    network: null,
};

class SidebarLinks extends React.Component {
    constructor(props) {
        super(props);
        this.chatSwitcherAnimation = new Animated.Value(0);
        this.sidebarAnimation = new Animated.Value(1);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isChatSwitcherActive !== this.props.isChatSwitcherActive) {
            Animated.timing(this.chatSwitcherAnimation, {
                toValue: this.props.isChatSwitcherActive ? 1 : 0,
                duration: 300,
            }).start();
            Animated.timing(this.sidebarAnimation, {
                toValue: this.props.isChatSwitcherActive ? 0 : 1,
                duration: 300,
            }).start();
        }
    }

    /**
     * Check if the report has a draft comment
     *
     * @param {Number} reportID
     * @returns {Boolean}
     */
    hasComment(reportID) {
        const allComments = get(this.props.comments, `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, '');
        return allComments.length > 0;
    }

    render() {
        const reportIDInUrl = parseInt(this.props.match.params.reportID, 10);
        const sortedReports = lodashOrderby(this.props.reports, [
            'isPinned',
            'reportName',
        ], [
            'desc',
            'asc',
        ]);

        // Filter the reports so that the only reports shown are pinned, unread, have draft
        // comments (but are not the open one), and the one matching the URL
        const reportsToDisplay = _.filter(sortedReports, report => (report.isPinned || (report.unreadActionCount > 0)
                || report.reportID === reportIDInUrl
                || (report.reportID !== reportIDInUrl && this.hasComment(report.reportID))));

        const chatSwitcherStyle = [
            {opacity: this.chatSwitcherAnimation},
            this.props.isChatSwitcherActive
                ? styles.sidebarHeaderActive
                : styles.sidebarHeader,
        ];

        const sidebarAnimation = [
            {opacity: this.sidebarAnimation},
            !this.props.isChatSwitcherActive
                ? styles.sidebarHeaderActive
                : styles.sidebarHeader,
        ];

        return (
            <View style={[styles.flex1, styles.h100, {marginTop: this.props.insets.top}]}>
                <Animated.View
                    style={[chatSwitcherStyle]}
                >
                    {this.props.isChatSwitcherActive && (
                        <>
                            <HeaderWithCloseButton
                                textSize="large"
                                title="Search"
                                onCloseButtonPress={() => ChatSwitcher.hide()}
                                shouldShowBorderBottom={false}
                            />
                            <ChatSwitcherView
                                onLinkClick={this.props.onLinkClick}
                            />
                        </>
                    )}
                </Animated.View>
                <Animated.View
                    style={sidebarAnimation}
                >
                    {!this.props.isChatSwitcherActive && (
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
                                    <MagnifyingGlassIcon width={20} height={20} />
                                </TouchableOpacity>
                                <AvatarWithIndicator
                                    source={this.props.myPersonalDetails.avatarURL}
                                    isActive={this.props.network && !this.props.network.isOffline}
                                />
                            </View>
                            <ScrollView
                                keyboardShouldPersistTaps="always"
                                style={styles.sidebarListContainer}
                                bounces={false}
                                indicatorStyle="white"
                            >
                                {/* A report will not have a report name if it hasn't been fetched from  */}
                                {/* the server yet so nothing is rendered */}
                                {_.map(reportsToDisplay, (report) => {
                                    const participantDetails = get(report, 'participants.length', 0) === 1
                                        ? get(this.props.personalDetails, report.participants[0], '') : '';
                                    const login = participantDetails ? participantDetails.login : '';
                                    return report.reportName && (
                                        <ChatLinkRow
                                            key={report.reportID}
                                            option={{
                                                text: participantDetails
                                                    ? participantDetails.displayName
                                                    : report.reportName,
                                                alternateText: Str.removeSMSDomain(login),
                                                type: participantDetails ? 'user' : 'report',

                                                // The icon for the row is set when we fetch personal details via
                                                // PersonalDetails.getFromReportParticipants()
                                                icons: report.icons,
                                                login,
                                                reportID: report.reportID,
                                                isUnread: report.unreadActionCount > 0,
                                                hasDraftComment: report.reportID !== reportIDInUrl
                                                    && this.hasComment(report.reportID),
                                            }}
                                            onSelectRow={() => {
                                                redirect(ROUTES.getReportRoute(report.reportID));
                                                this.props.onLinkClick();
                                            }}
                                            optionIsFocused={report.reportID === reportIDInUrl}
                                        />
                                    );
                                })}
                            </ScrollView>
                        </>
                    )}
                </Animated.View>
            </View>
        );
    }
}

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
        myPersonalDetails: {
            key: ONYXKEYS.MY_PERSONAL_DETAILS,
        },
        network: {
            key: ONYXKEYS.NETWORK,
        },
    }),
)(SidebarLinks);
