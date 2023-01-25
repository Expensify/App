import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import lodashGet from 'lodash/get';
import RoomHeaderAvatars from '../components/RoomHeaderAvatars';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import DisplayNames from '../components/DisplayNames';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as ReportUtils from '../libs/ReportUtils';
import participantPropTypes from '../components/participantPropTypes';
import * as Expensicons from '../components/Icon/Expensicons';
import ROUTES from '../ROUTES';
import MenuItem from '../components/MenuItem';
import Text from '../components/Text';
import CONST from '../CONST';
import reportPropTypes from './reportPropTypes';
import withReportOrNavigateHome from './home/report/withReportOrNavigateHome';

const propTypes = {
    ...withLocalizePropTypes,

    /** Whether or not to show the Compose Input */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }).isRequired,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }).isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/details */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes).isRequired,
};

class ReportDetailsPage extends Component {
    constructor(props) {
        super(props);

        this.renderOptions = this.renderOptions.bind(this);
    }

    renderOptions() {
        if (ReportUtils.isArchivedRoom(this.props.report)) {
            return null;
        }

        const shouldShowSettingsOption = (ReportUtils.isPolicyExpenseChat(this.props.report) || ReportUtils.isChatRoom(this.props.report))
            && (!ReportUtils.isRestrictedPolicyRoom(this.props.report) || ReportUtils.isRestrictedRoomParticipant(this.props.report))
        const shouldShowInviteAndLeaveOptions = ReportUtils.isRestrictedRoomParticipant(this.props.report)
            || (!ReportUtils.isRestrictedPolicyRoom(this.props.report) && ReportUtils.isUserCreatedPolicyRoom(this.props.report));

        return (
            <>
                { /* All nonarchived chats should let you see their members */}
                <MenuItem
                    key={CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS}
                    title={this.props.translate('common.members')}
                    subtitle={lodashGet(this.props.report, 'participants', []).length}
                    icon={Expensicons.Users}
                    onPress={() => { Navigation.navigate(ROUTES.getReportParticipantsRoute(this.props.report.reportID)); }}
                    shouldShowRightIcon
                    brickRoadIndicator={ReportUtils.hasReportNameError(this.props.report) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : ''}
                />
                {shouldShowSettingsOption && (
                    <MenuItem
                        key={CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS}
                        title={this.props.translate('common.settings')}
                        icon={Expensicons.Gear}
                        onPress={() => { Navigation.navigate(ROUTES.getReportSettingsRoute(this.props.report.reportID)); }}
                        shouldShowRightIcon
                    />
                )}
                {shouldShowInviteAndLeaveOptions && (
                    <>
                        <MenuItem
                            key={CONST.REPORT_DETAILS_MENU_ITEM.INVITE}
                            title={this.props.translate('common.invite')}
                            icon={Expensicons.Plus}
                            onPress={() => { Navigation.navigate(ROUTES.getRoomInviteRoute(this.props.report.reportID)); }}
                            shouldShowRightIcon
                        />
                        <MenuItem
                            key={CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM}
                            title={this.props.translate('common.leaveRoom')}
                            icon={Expensicons.Exit}
                            onPress={() => { /* Placeholder for when leaving rooms is built in */ }}
                            shouldShowRightIcon
                        />
                    </>
                )}
            </>
        );
    }

    render() {
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(this.props.report);
        const isChatRoom = ReportUtils.isChatRoom(this.props.report);
        const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(this.props.report, this.props.policies);
        const participants = lodashGet(this.props.report, 'participants', []);
        const isMultipleParticipant = participants.length > 1;
        const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
            OptionsListUtils.getPersonalDetailsForLogins(participants, this.props.personalDetails),
            isMultipleParticipant,
        );

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <ScrollView style={[styles.flex1]}>
                    <View style={[styles.m5]}>
                        <View
                            style={styles.reportDetailsTitleContainer}
                        >
                            <View style={styles.mb4}>
                                <RoomHeaderAvatars
                                    icons={ReportUtils.getIcons(this.props.report, this.props.personalDetails, this.props.policies)}
                                    shouldShowLargeAvatars={isPolicyExpenseChat}
                                />
                            </View>
                            <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
                                <View style={[styles.alignSelfCenter, styles.w100]}>
                                    <DisplayNames
                                        fullTitle={ReportUtils.getReportName(this.props.report, this.props.policies)}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled
                                        numberOfLines={1}
                                        textStyles={[styles.textHeadline, styles.mb2, styles.textAlignCenter]}
                                        shouldUseFullTitle={isChatRoom || isPolicyExpenseChat}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.sidebarLinkText,
                                        styles.optionAlternateText,
                                        styles.textLabelSupporting,
                                        styles.mb2,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {chatRoomSubtitle}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {this.renderOptions()}
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ReportDetailsPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withReportOrNavigateHome,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(ReportDetailsPage);
