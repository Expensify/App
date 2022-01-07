import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import * as Report from '../libs/actions/Report';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';
import Button from '../components/Button';
import TextInputWithPrefix from '../components/TextInputWithPrefix';
import Picker from '../components/Picker';


const propTypes = {
    /* Onyx Props */

    /** The active report */
    report: PropTypes.shape({
        /** The list of icons */
        icons: PropTypes.arrayOf(PropTypes.string),

        /** The report name */
        reportName: PropTypes.string,

        /** ID of the report */
        reportID: PropTypes.number,

        /** The current user's notification preference for this report */
        notificationPreference: PropTypes.string,
    }).isRequired,

    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/settings */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};


const ReportSettingsPage = (props) => {
    const notificationPreferencesOptions = {
        default: {
            value: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            label: props.translate('notificationPreferences.always'),
        },
        daily: {
            value: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
            label: props.translate('notificationPreferences.daily'),
        },
        mute: {
            value: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
            label: props.translate('notificationPreferences.mute'),
        },
    };
    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('common.settings')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack()}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView style={styles.flex1}>
                <View style={[styles.m5]}>
                    <View>
                        <View style={styles.mt4}>
                            <Text style={[styles.formLabel]} numberOfLines={1}>
                                {props.translate('common.notifications')}
                            </Text>
                            <Text>
                                {props.translate('notificationPreferences.description')}
                            </Text>
                        </View>
                        <View style={[styles.mb5, styles.mt2]}>
                            <Picker
                                label={props.translate('notificationPreferences.label')}
                                onChange={(notificationPreference) => {
                                    Report.updateNotificationPreference(
                                        props.report.reportID,
                                        notificationPreference,
                                    );
                                }}
                                items={_.values(notificationPreferencesOptions)}
                                value={props.report.notificationPreference}
                            />
                        </View>
                    </View>
                    <View style={styles.mt4}>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            {props.translate('newRoomPage.roomName')}
                        </Text>
                        <View style={[styles.flexRow]}>
                            <View style={[styles.flex3]}>
                                <TextInputWithPrefix
                                    label={props.translate('newRoomPage.roomName')}
                                    prefixCharacter="#"
                                    placeholder={props.translate('newRoomPage.social')}
                                    onChangeText={() => {}}
                                    value=""
                                    errorText=""
                                    autoCapitalize="none"
                                />
                            </View>
                            <View styles={[styles.flex1, styles.mt4]}>
                                <Button
                                    success
                                    text={props.translate('common.save')}
                                    onPress={() => {
                                        // Submit a name change for this policyRoom
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[styles.mt4]}>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            {props.translate('workspace.common.workspace')}
                        </Text>
                        <Text numberOfLines={1}>
                            TODO
                        </Text>
                    </View>
                    <View style={[styles.mt4]}>
                        <Text style={[styles.formLabel]} numberOfLines={1}>
                            {props.translate('newRoomPage.visibility')}
                        </Text>
                        <Text numberOfLines={1}>
                            TODO
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.displayName = 'ReportSettingsPage';

export default compose(
    withLocalize,
    withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
    }),
)(ReportSettingsPage);
