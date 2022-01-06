import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {View} from 'react-native';
import CONST from '../CONST';
import styles from '../styles/styles';
import * as Report from '../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import Picker from './Picker';
import Text from './Text';

const propTypes = {
    /** The report whose notification preferences to show */
    report: PropTypes.shape({
        /** ID of the report */
        reportID: PropTypes.number,

        /** The current user's notification preference for this report */
        notificationPreference: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};

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
            <View style={styles.mt4}>
                <Text style={[styles.formLabel]} numberOfLines={1}>
                    {props.translate('common.notifications')}
                </Text>
            </View>
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
};

NotificationPreferences.propTypes = propTypes;
NotificationPreferences.displayName = 'NotificationPreferences';

export default withLocalize(NotificationPreferences);
