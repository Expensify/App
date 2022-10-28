import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {Freeze} from 'react-freeze';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import ONYXKEYS from '../../../ONYXKEYS';
import safeAreaInsetPropTypes from '../../safeAreaInsetPropTypes';
import compose from '../../../libs/compose';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import Icon from '../../../components/Icon';
import Header from '../../../components/Header';
import * as Expensicons from '../../../components/Icon/Expensicons';
import AvatarWithIndicator from '../../../components/AvatarWithIndicator';
import Tooltip from '../../../components/Tooltip';
import CONST from '../../../CONST';
import participantPropTypes from '../../../components/participantPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as App from '../../../libs/actions/App';
import * as ReportUtils from '../../../libs/ReportUtils';
import withCurrentUserPersonalDetails from '../../../components/withCurrentUserPersonalDetails';
import withWindowDimensions from '../../../components/withWindowDimensions';
import reportActionPropTypes from '../report/reportActionPropTypes';
import LHNOptionsList from '../../../components/LHNOptionsList/LHNOptionsList';
import SidebarUtils from '../../../libs/SidebarUtils';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /** Toggles the navigation menu open and closed */
    onLinkClick: PropTypes.func.isRequired,

    /** Navigates to settings and hides sidebar */
    onAvatarClick: PropTypes.func.isRequired,

    /** Safe area insets required for mobile devices margins */
    insets: safeAreaInsetPropTypes.isRequired,

    /* Onyx Props */
    /** List of reports */
    // eslint-disable-next-line react/no-unused-prop-types
    reports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** List of users' personal details */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The personal details of the person who is logged in */
    currentUserPersonalDetails: PropTypes.shape({
        /** Display name of the current user from their personal details */
        displayName: PropTypes.string,

        /** Avatar URL of the current user from their personal details */
        avatar: PropTypes.string,
    }),

    /** Current reportID from the route in react navigation state object */
    reportIDFromRoute: PropTypes.string,

    /** Whether we are viewing below the responsive breakpoint */
    isSmallScreenWidth: PropTypes.bool.isRequired,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    reports: {},
    reportActions: {},
    personalDetails: {},
    currentUserPersonalDetails: {
        avatar: ReportUtils.getDefaultAvatar(),
    },
    reportIDFromRoute: '',
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
};

class SidebarLinks extends React.Component {
    showSearchPage() {
        Navigation.navigate(ROUTES.SEARCH);
    }

    render() {
        // Wait until the personalDetails are actually loaded before displaying the LHN
        if (_.isEmpty(this.props.personalDetails)) {
            return null;
        }
        const optionListItems = SidebarUtils.getOrderedReportIDs(this.props.reportIDFromRoute);
        return (
            <View
                accessibilityElementsHidden={this.props.isSmallScreenWidth && !this.props.isDrawerOpen}
                accessibilityLabel="List of chats"
                style={[styles.flex1, styles.h100]}
            >
                <View
                    style={[
                        styles.flexRow,
                        styles.ph5,
                        styles.pv3,
                        styles.justifyContentBetween,
                        styles.alignItemsCenter,
                    ]}
                    nativeID="drag-area"
                >
                    <Header
                        textSize="large"
                        title={this.props.translate('sidebarScreen.headerChat')}
                        accessibilityLabel={this.props.translate('sidebarScreen.headerChat')}
                        accessibilityRole="text"
                        shouldShowEnvironmentBadge
                    />
                    <Tooltip text={this.props.translate('common.search')}>
                        <TouchableOpacity
                            accessibilityLabel={this.props.translate('sidebarScreen.buttonSearch')}
                            accessibilityRole="button"
                            style={[styles.flexRow, styles.ph5]}
                            onPress={this.showSearchPage}
                        >
                            <Icon src={Expensicons.MagnifyingGlass} />
                        </TouchableOpacity>
                    </Tooltip>
                    <TouchableOpacity
                        accessibilityLabel={this.props.translate('sidebarScreen.buttonMySettings')}
                        accessibilityRole="button"
                        onPress={this.props.onAvatarClick}
                    >
                        <AvatarWithIndicator
                            source={this.props.currentUserPersonalDetails.avatar}
                            tooltipText={this.props.translate('common.settings')}
                        />
                    </TouchableOpacity>
                </View>
                <Freeze freeze={this.props.isSmallScreenWidth && !this.props.isDrawerOpen}>
                    <LHNOptionsList
                        contentContainerStyles={[
                            styles.sidebarListContainer,
                            {paddingBottom: StyleUtils.getSafeAreaMargins(this.props.insets).marginBottom},
                        ]}
                        data={optionListItems}
                        focusedIndex={_.findIndex(optionListItems, (
                            option => option.toString() === this.props.reportIDFromRoute
                        ))}
                        onSelectRow={(option) => {
                            Navigation.navigate(ROUTES.getReportRoute(option.reportID));
                            this.props.onLinkClick();
                        }}
                        shouldDisableFocusOptions={this.props.isSmallScreenWidth}
                        optionMode={this.props.priorityMode === CONST.PRIORITY_MODE.GSD ? 'compact' : 'default'}
                        onLayout={App.setSidebarLoaded}
                    />
                </Freeze>
            </View>
        );
    }
}

SidebarLinks.propTypes = propTypes;
SidebarLinks.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withWindowDimensions,
    withOnyx({
        // Note: It is very important that the keys subscribed to here are the same
        // keys that are subscribed to at the top of SidebarUtils.js. If there was a key missing from here and data was updated
        // for that key, then there would be no re-render and the options wouldn't reflect the new data because SidebarUtils.getOrderedReportIDs() wouldn't be triggered.
        // This could be changed if each OptionRowLHN used withOnyx() to connect to the Onyx keys, but if you had 10,000 reports
        // with 10,000 withOnyx() connections, it would have unknown performance implications.
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
            selector: report => report && ({
                reportID: report.reportID,
                participants: report.participants,
                hasDraft: report.hasDraft,
                isPinned: report.isPinned,
                errorFields: {
                    addWorkspaceRoom: report.errorFields && report.errorFields.addWorkspaceRoom,
                },
                maxSequenceNumber: report.maxSequenceNumber,
                lastReadSequenceNumber: report.lastReadSequenceNumber,
                lastMessageText: report.lastMessageText,
                lastMessageTimestamp: report.lastMessageTimestamp,
                iouReportID: report.iouReportID,
                hasOutstandingIOU: report.hasOutstandingIOU,
                statusNum: report.statusNum,
                stateNum: report.stateNum,
                chatType: report.chatType,
                policyID: report.policyID,
            }),
        },
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
            selector: personalDetails => _.reduce(personalDetails, (finalPersonalDetails, personalData, login) => {
                // It's OK to do param-reassignment in _.reduce() because we absolutely know the starting state of finalPersonalDetails
                // eslint-disable-next-line no-param-reassign
                finalPersonalDetails[login] = {
                    login: personalData.login,
                    displayName: personalData.displayName,
                    firstName: personalData.firstName,
                    avatar: personalData.avatar,
                };
                return finalPersonalDetails;
            }, {}),
        },
        priorityMode: {
            key: ONYXKEYS.NVP_PRIORITY_MODE,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActions => reportActions && _.map(reportActions, reportAction => ({
                errors: reportAction.errors,
            })),
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
            selector: policy => policy && ({
                type: policy.type,
                name: policy.name,
            }),
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(SidebarLinks);
