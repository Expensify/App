import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Picker from '../components/Picker';


const propTypes = {
    /* Onyx Props */

    /** The active report */
    report: PropTypes.shape({
        /** The list of icons */
        icons: PropTypes.arrayOf(PropTypes.string),

        /** The report name */
        reportName: PropTypes.string,
    }).isRequired,

    ...withLocalizePropTypes,
};


const ReportSettingsPage = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('common.settings')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.goBack()}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <ScrollView>
            <View>
                <View style={styles.mt4}>
                    <Text style={[styles.formLabel]} numberOfLines={1}>
                        {props.translate('common.notifications')}
                    </Text>
                </View>
                <View>
                    <View style={[styles.mb5]}>
                        <Picker
                            // eslint-disable-next-line max-len
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
            </View>
        </ScrollView>
    </ScreenWrapper>
);

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
