import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import {Image, View} from 'react-native';
import lodashGet from 'lodash/get';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import ONYXKEYS from '../ONYXKEYS';
import ScreenWrapper from '../components/ScreenWrapper';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import styles from '../styles/styles';
import DisplayNames from '../components/DisplayNames';
import {getPersonalDetailsForLogins} from '../libs/OptionsListUtils';
import {getDefaultRoomSubtitle, isDefaultRoom} from '../libs/reportUtils';
import {participantPropTypes} from './home/sidebar/optionPropTypes';
import Picker from '../components/Picker';
import {updateNotificationPreference} from '../libs/actions/Report';
import {Users} from '../components/Icon/Expensicons';
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
                value: 'always',
                label: props.translate('reportDetailsPage.always'),

            },
            daily: {
                value: 'daily',
                label: props.translate('reportDetailsPage.daily'),
            },
            mute: {
                value: 'mute',
                label: props.translate('reportDetailsPage.mute'),
            },
        };

        this.menuItems = [
            {
                translationKey: 'reportDetailsPage.members',
                icon: Users,
                subtitle: props.report.participants.length,
                action: () => { Navigation.navigate(ROUTES.getReportParticipantsRoute(props.report.reportID)); },
            },
        ];
    }

    render() {
        const defaultRoomSubtitle = getDefaultRoomSubtitle(this.props.report, this.props.policies);
        const participants = lodashGet(this.props.report, 'participants', []);
        const isMultipleParticipant = participants.length > 1;
        const displayNamesWithTooltips = _.map(
            getPersonalDetailsForLogins(participants, this.props.personalDetails),
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
                <View style={[styles.flex1]}>
                    <View style={[styles.m5]}>
                        <View
                            style={styles.reportDetailsTitleContainer}
                        >
                            <Image
                                source={{uri: this.props.report.icons[0]}}
                                style={[styles.singleAvatarLarge, styles.mb4]}
                            />
                            <View style={styles.reportDetailsRoomInfo}>
                                <DisplayNames
                                    fullTitle={this.props.report.reportName}
                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                    tooltipEnabled
                                    numberOfLines={1}
                                    textStyles={[styles.headerText, styles.mb2]}
                                    shouldUseFullTitle={isDefaultRoom(this.props.report)}
                                />
                                <Text
                                    style={[styles.sidebarLinkText, styles.optionAlternateText, styles.mb6]}
                                    numberOfLines={1}
                                >
                                    {defaultRoomSubtitle}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.mt4}>
                            <Text style={[styles.formLabel]} numberOfLines={1}>
                                {this.props.translate('common.notifications')}
                            </Text>
                        </View>
                        <View>
                            <Text style={[styles.mb3]}>
                                {this.props.translate('reportDetailsPage.notificationPreferencesDescription')}
                            </Text>
                            <View style={[styles.mb5]}>
                                <Picker
                                    onChange={(notificationPreference) => {
                                        updateNotificationPreference(
                                            this.props.report.reportID,
                                            notificationPreference,
                                        );
                                    }}
                                    items={Object.values(this.notificationPreferencesOptions)}
                                    value={this.props.report.notificationPreference}
                                />
                            </View>
                        </View>
                    </View>
                    {this.menuItems.map((item) => {
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
                </View>
            </ScreenWrapper>
        );
    }
}

ReportDetailsPage.displayName = 'ReportDetailsPage';
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
