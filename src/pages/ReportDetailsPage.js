import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
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
import * as ReportUtils from '../libs/reportUtils';
import {participantPropTypes} from './home/sidebar/optionPropTypes';
import * as Expensicons from '../components/Icon/Expensicons';
import ROUTES from '../ROUTES';
import MenuItem from '../components/MenuItem';
import Text from '../components/Text';

const propTypes = {
    ...withLocalizePropTypes,

    /** Whether or not to show the Compose Input */
    session: PropTypes.shape({
        accountID: PropTypes.number,
    }).isRequired,

    /** The report currently being looked at */
    report: PropTypes.shape({
        /** Name of the report */
        reportName: PropTypes.string,

        /** List of primarylogins of participants of the report */
        participants: PropTypes.arrayOf(PropTypes.string),

        /** List of icons for report participants */
        icons: PropTypes.arrayOf(PropTypes.string),

        /** ID of the report */
        reportID: PropTypes.number,
    }).isRequired,

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

        this.menuItems = [];
        if (ReportUtils.isArchivedRoom(this.props.report)) {
            return;
        }

        // All nonarchived chats should let you see their members
        this.menuItems.push({
            translationKey: 'common.members',
            icon: Expensicons.Users,
            subtitle: props.report.participants.length,
            action: () => { Navigation.navigate(ROUTES.getReportParticipantsRoute(props.report.reportID)); },
        });

        // Chat rooms will allow you to do more things than typical chats so they have extra options
        if (ReportUtils.isChatRoom(this.props.report)) {
            this.menuItems = this.menuItems.concat([
                {
                    translationKey: 'common.settings',
                    icon: Expensicons.Gear,
                    action: () => { Navigation.navigate(ROUTES.getReportSettingsRoute(props.report.reportID)); },
                },
                {
                    translationKey: 'common.invite',
                    icon: Expensicons.Plus,
                    action: () => { /* Placeholder for when inviting other users is built in */ },
                },
                {
                    translationKey: 'common.leaveRoom',
                    icon: Expensicons.Exit,
                    action: () => { /* Placeholder for when leaving rooms is built in */ },
                },
            ]);
        }

        // Policy Expense Chats will also allow the user to see settings[]
        if (ReportUtils.isPolicyExpenseChat(this.props.report)) {
            this.menuItems = this.menuItems.concat([
                {
                    translationKey: 'common.settings',
                    icon: Expensicons.Gear,
                    action: () => { Navigation.navigate(ROUTES.getReportSettingsRoute(props.report.reportID)); },
                },
            ])
        }
    }

    render() {
        const isChatRoom = ReportUtils.isChatRoom(this.props.report);
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(this.props.report);
        const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(this.props.report, this.props.policies);
        const participants = lodashGet(this.props.report, 'participants', []);
        const isMultipleParticipant = participants.length > 1;
        const displayNamesWithTooltips = _.map(
            OptionsListUtils.getPersonalDetailsForLogins(participants, this.props.personalDetails),
            ({displayName, firstName, login}) => {
                const displayNameTrimmed = Str.isSMSLogin(login) ? this.props.toLocalPhone(displayName) : displayName;

                return {
                    displayName: (isMultipleParticipant ? firstName : displayNameTrimmed) || Str.removeSMSDomain(login),
                    tooltip: Str.removeSMSDomain(login),
                };
            },
        );
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.details')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView style={[styles.flex1]}>
                    <View style={[styles.m5]}>
                        <View
                            style={styles.reportDetailsTitleContainer}
                        >
                            <View style={styles.mb4}>
                                <RoomHeaderAvatars
                                    avatarIcons={OptionsListUtils.getAvatarSources(this.props.report)}
                                    shouldShowLargeAvatars={isPolicyExpenseChat}
                                />
                            </View>
                            <View style={[styles.reportDetailsRoomInfo, styles.mw100]}>
                                <View style={[styles.alignSelfCenter, styles.w100]}>
                                    <DisplayNames
                                        fullTitle={this.props.report.reportName}
                                        displayNamesWithTooltips={displayNamesWithTooltips}
                                        tooltipEnabled
                                        numberOfLines={1}
                                        textStyles={[styles.headerText, styles.mb2, styles.textAlignCenter]}
                                        shouldUseFullTitle={isChatRoom || isPolicyExpenseChat}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.sidebarLinkText,
                                        styles.optionAlternateText,
                                        styles.textLabelSupporting,
                                        styles.mb5,
                                    ]}
                                    numberOfLines={1}
                                >
                                    {chatRoomSubtitle}
                                </Text>
                            </View>
                        </View>
                    </View>
                    {_.map(this.menuItems, (item) => {
                        const keyTitle = item.translationKey ? this.props.translate(item.translationKey) : item.title;
                        return (
                            <MenuItem
                                key={keyTitle}
                                title={keyTitle}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                onPress={item.action}
                                iconStyles={item.iconStyles}
                                iconFill={item.iconFill}
                                shouldShowRightIcon
                            />
                        );
                    })}
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ReportDetailsPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
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
