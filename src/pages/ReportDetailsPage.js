import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import {View, ScrollView, Pressable} from 'react-native';
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
import * as PolicyUtils from '../libs/PolicyUtils';
import * as Report from '../libs/actions/Report';
import * as Session from '../libs/actions/Session';
import participantPropTypes from '../components/participantPropTypes';
import * as Expensicons from '../components/Icon/Expensicons';
import ROUTES from '../ROUTES';
import MenuItem from '../components/MenuItem';
import Text from '../components/Text';
import CONST from '../CONST';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
    ...withLocalizePropTypes,

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/details */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),
};

const defaultProps = {
    policies: {},
    personalDetails: {},
};

class ReportDetailsPage extends Component {
    getPolicy() {
        return this.props.policies[`${ONYXKEYS.COLLECTION.POLICY}${this.props.report.policyID}`];
    }

    getMenuItems() {
        const menuItems = [
            {
                key: CONST.REPORT_DETAILS_MENU_ITEM.SHARE_CODE,
                translationKey: 'common.shareCode',
                icon: Expensicons.QrCode,
                action: () => Navigation.navigate(ROUTES.getReportShareCodeRoute(this.props.report.reportID)),
            },
        ];

        if (ReportUtils.isArchivedRoom(this.props.report)) {
            return [];
        }

        if (lodashGet(this.props.report, 'participants', []).length) {
            menuItems.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.MEMBERS,
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: lodashGet(this.props.report, 'participants', []).length,
                action: () => {
                    Navigation.navigate(ROUTES.getReportParticipantsRoute(this.props.report.reportID));
                },
            });
        }

        if (ReportUtils.isPolicyExpenseChat(this.props.report) || ReportUtils.isChatRoom(this.props.report) || ReportUtils.isThread(this.props.report)) {
            menuItems.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS,
                translationKey: 'common.settings',
                icon: Expensicons.Gear,
                action: () => {
                    Navigation.navigate(ROUTES.getReportSettingsRoute(this.props.report.reportID));
                },
            });
        }

        const policy = this.getPolicy();
        const isThread = ReportUtils.isThread(this.props.report);
        if (ReportUtils.isUserCreatedPolicyRoom(this.props.report) || ReportUtils.canLeaveRoom(this.props.report, !_.isEmpty(policy)) || isThread) {
            menuItems.push({
                key: CONST.REPORT_DETAILS_MENU_ITEM.LEAVE_ROOM,
                translationKey: isThread ? 'common.leaveThread' : 'common.leaveRoom',
                icon: Expensicons.Exit,
                action: () => Report.leaveRoom(this.props.report.reportID),
            });
        }

        return menuItems;
    }

    render() {
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(this.props.report);
        const isChatRoom = ReportUtils.isChatRoom(this.props.report);
        const isThread = ReportUtils.isThread(this.props.report);
        const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(this.props.report);
        const participants = lodashGet(this.props.report, 'participants', []);
        const isMultipleParticipant = participants.length > 1;
        const displayNamesWithTooltips = ReportUtils.getDisplayNamesWithTooltips(
            OptionsListUtils.getPersonalDetailsForLogins(participants, this.props.personalDetails),
            isMultipleParticipant,
        );
        const menuItems = this.getMenuItems();
        const isPolicyAdmin = PolicyUtils.isPolicyAdmin(this.getPolicy());
        const chatRoomSubtitleText = (
            <Text
                style={[styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting, styles.mb2, styles.pre]}
                numberOfLines={1}
            >
                {chatRoomSubtitle}
            </Text>
        );
        return (
            <ScreenWrapper>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.report)}>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.details')}
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView style={[styles.flex1]}>
                        <View style={[styles.m5]}>
                            <View style={styles.reportDetailsTitleContainer}>
                                <View style={styles.mb4}>
                                    <RoomHeaderAvatars icons={ReportUtils.getIcons(this.props.report, this.props.personalDetails, this.props.policies)} />
                                </View>
                                <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
                                    <View style={[styles.alignSelfCenter, styles.w100]}>
                                        <DisplayNames
                                            fullTitle={ReportUtils.getReportName(this.props.report)}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={[styles.textHeadline, styles.mb2, styles.textAlignCenter, styles.pre]}
                                            shouldUseFullTitle={isChatRoom || isPolicyExpenseChat || isThread}
                                        />
                                    </View>
                                    {isPolicyAdmin ? (
                                        <Pressable
                                            onPress={() => {
                                                Navigation.navigate(ROUTES.getWorkspaceInitialRoute(this.props.report.policyID));
                                            }}
                                        >
                                            {chatRoomSubtitleText}
                                        </Pressable>
                                    ) : (
                                        chatRoomSubtitleText
                                    )}
                                </View>
                            </View>
                        </View>
                        {_.map(menuItems, (item) => {
                            const brickRoadIndicator =
                                ReportUtils.hasReportNameError(this.props.report) && item.key === CONST.REPORT_DETAILS_MENU_ITEM.SETTINGS ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
                            return (
                                <MenuItem
                                    key={item.key}
                                    title={this.props.translate(item.translationKey)}
                                    subtitle={item.subtitle}
                                    icon={item.icon}
                                    onPress={Session.checkIfActionIsAllowed(item.action)}
                                    shouldShowRightIcon
                                    brickRoadIndicator={brickRoadIndicator}
                                />
                            );
                        })}
                    </ScrollView>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ReportDetailsPage.propTypes = propTypes;
ReportDetailsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(ReportDetailsPage);
