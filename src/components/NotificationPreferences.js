import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View} from 'react-native';
import styles from '../styles/styles';
import * as Report from '../libs/actions/Report';
import withLocalize, { withLocalizePropTypes } from "./withLocalize";

const propTypes = {
    /** The report whose notification preferences to show */
    report: PropTypes.oneOfType([PropTypes.object]),

    ...withLocalizePropTypes,
}

const NotificationPreferences = (props) => {
    const notificationPreferencesOptions = {
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
    return (
        <View>
            <View style={[styles.mb5]}>
                <Picker
                    label={props.translate('reportDetailsPage.notificationPreferencesDescription')}
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
    );
}

NotificationPreferences.propTypes = propTypes;
NotificationPreferences.displayName = 'NotificationPreferences';

export default compose(
    withLocalize,
)(NotificationPreferences);