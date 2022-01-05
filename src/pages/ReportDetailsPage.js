import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import {View, ScrollView} from 'react-native';
import lodashGet from 'lodash/get';
import Avatar from '../components/Avatar';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import DisplayNames from '../components/DisplayNames';
import * as OptionsListUtils from '../libs/OptionsListUtils';
import * as ReportUtils from '../libs/reportUtils';
import {participantPropTypes} from './home/sidebar/optionPropTypes';
import * as Report from '../libs/actions/Report';
import * as Expensicons from '../components/Icon/Expensicons';
import ROUTES from '../ROUTES';
import MenuItem from '../components/MenuItem';
import Picker from '../components/Picker';
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

        /** The current user's notification preference for this report */
        notificationPreference: PropTypes.string,
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

        this.notificationPreferencesOptions = {
            default: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                label: props.translate('reportDetailsPage.always'),

            },
            daily: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
                label: props.translate('reportDetailsPage.daily'),
            },
            mute: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
                label: props.translate('reportDetailsPage.mute'),
            },
        };

        if (ReportUtils.isArchivedRoom(this.props.report)) {
            this.menuItems = [];
        } else if (ReportUtils.isUserCreatedPolicyRoom(this.props.report)) {
            this.menuItems = [
                {
                    translationKey: 'common.members',
                    icon: Expensicons.Users,
                    subtitle: props.report.participants.length,
                    action: () => { Navigation.navigate(ROUTES.getReportParticipantsRoute(props.report.reportID)); },
                },
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
            ];
        } else {
            this.menuItems = {
                translationKey: 'common.members',
                icon: Expensicons.Users,
                subtitle: props.report.participants.length,
                action: () => { Navigation.navigate(ROUTES.getReportParticipantsRoute(props.report.reportID)); },
            };
        }
    }

    render() {
        const isChatRoom = ReportUtils.isChatRoom(this.props.report);
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
                            <Avatar
                                isChatRoom={isChatRoom}
                                isArchivedRoom={ReportUtils.isArchivedRoom(this.props.report)}
                                containerStyles={[styles.singleAvatarLarge, styles.mb4]}
                                imageStyles={[styles.singleAvatarLarge]}
                                source={this.props.report.icons[0]}
                            />
                            <View style={styles.reportDetailsRoomInfo}>
                                <DisplayNames
                                    fullTitle={this.props.report.reportName}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.mb2]}
                                    shouldUseFullTitle={isChatRoom}
                                />
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
                        {!ReportUtils.isArchivedRoom(this.props.report) && (
                            <View>
                                <View style={styles.mt4}>
                                    <Text style={[styles.formLabel]} numberOfLines={1}>
                                        {this.props.translate('common.notifications')}
                                    </Text>
                                </View>
                                <View>
                                    <View style={[styles.mb5]}>
                                        <Picker
                                            // eslint-disable-next-line max-len
                                            label={this.props.translate('reportDetailsPage.notificationPreferencesDescription')}
                                            onChange={(notificationPreference) => {
                                                Report.updateNotificationPreference(
                                                    this.props.report.reportID,
                                                    notificationPreference,
                                                );
                                            }}
                                            items={_.values(this.notificationPreferencesOptions)}
                                            value={this.props.report.notificationPreference}
                                        />
                                    </View>
                                </View>
                            </View>
                        )}
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
