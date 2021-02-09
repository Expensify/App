import React from 'react';
import {Animated, View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import styles, {getSafeAreaMargins} from '../../../styles/styles';
import ONYXKEYS from '../../../ONYXKEYS';
import SafeAreaInsetPropTypes from '../../SafeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import {redirect} from '../../../libs/actions/App';
import ROUTES from '../../../ROUTES';
import * as ChatSwitcher from '../../../libs/actions/ChatSwitcher';
import Icon from '../../../components/Icon';
import Header from '../../../components/Header';
import OptionsList from '../../../components/OptionsList';
import {MagnifyingGlass} from '../../../components/Icon/Expensicons';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import {getSidebarOptions} from '../../../libs/OptionsListUtils';
import {getDefaultAvatar} from '../../../libs/actions/PersonalDetails';
import KeyboardSpacer from '../../../components/KeyboardSpacer';
import SearchView from '../../../components/SearchView';

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

class SidebarLinks extends React.Component {
    constructor(props) {
        super(props);
        this.chatSwitcherAnimation = new Animated.Value(props.isChatSwitcherActive ? 1 : 0);
        this.sidebarAnimation = new Animated.Value(props.isChatSwitcherActive ? 0 : 1);
        this.hideChatSwitcher = this.hideChatSwitcher.bind(this);
        this.showChatSwitcher = this.showChatSwitcher.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isChatSwitcherActive !== this.props.isChatSwitcherActive) {
            Animated.timing(this.chatSwitcherAnimation, {
                toValue: this.props.isChatSwitcherActive ? 1 : 0,
                duration: 240,
                useNativeDriver: false,
            }).start();
            Animated.timing(this.sidebarAnimation, {
                toValue: this.props.isChatSwitcherActive ? 0 : 1,
                duration: 240,
                useNativeDriver: false,
            }).start();
        }
    }

    hideChatSwitcher() {
        ChatSwitcher.hide();
    }

    showChatSwitcher() {
        ChatSwitcher.show();
    }

    render() {
        const activeReportID = parseInt(this.props.currentlyViewedReportID, 10);

        const chatSwitcherStyle = [
            {opacity: this.chatSwitcherAnimation},
            this.props.isChatSwitcherActive
                ? styles.sidebarHeaderActive
                : styles.sidebarHeader,
        ];

        const {recentReports} = getSidebarOptions(
            this.props.reports,
            this.props.personalDetails,
            this.props.draftComments,
            activeReportID,
        );

        const sections = [{
            title: '',
            indexOffset: 0,
            data: recentReports,
            shouldShow: true,
        }];

        const sidebarStyle = [
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
                    <HeaderWithCloseButton
                        textSize="large"
                        title="Search"
                        onCloseButtonPress={this.hideChatSwitcher}
                        shouldShowBorderBottom={false}
                    />
                    <SearchView onLinkClick={this.props.onLinkClick} />
                </Animated.View>
                <Animated.View
                    style={[sidebarStyle]}
                >
                    <View style={[
                        !this.props.isChatSwitcherActive ? styles.dFlex : styles.dNone,
                        styles.flexRow,
                        styles.ph5,
                        styles.pv3,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    >
                        <Header textSize="large" title="Chats" />
                        <TouchableOpacity
                            style={[styles.flexRow, styles.ph5]}
                            onPress={this.showChatSwitcher}
                        >
                            <Icon src={MagnifyingGlass} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.props.onAvatarClick}
                        >
                            <AvatarWithIndicator
                                source={this.props.myPersonalDetails.avatarURL}
                                isActive={this.props.network && !this.props.network.isOffline}
                            />
                        </TouchableOpacity>
                    </View>
                    <OptionsList
                        contentContainerStyles={[
                            styles.sidebarListContainer,
                            {paddingBottom: getSafeAreaMargins(this.props.insets).marginBottom},
                        ]}
                        sections={sections}
                        focusedIndex={_.findIndex(recentReports, (
                            option => option.reportID === activeReportID
                        ))}
                        onSelectRow={(option) => {
                            redirect(ROUTES.getReportRoute(option.reportID));
                            this.props.onLinkClick();
                        }}
                        hideSectionHeaders
                    />
                    <KeyboardSpacer />
                </Animated.View>
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

export default compose(
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
