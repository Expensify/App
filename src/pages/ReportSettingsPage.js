import React from 'react';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import NotificationPreferences from '../components/NotificationPreferences';


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


const ReportSettingsPage = props => (
    <ScreenWrapper>
        <HeaderWithCloseButton
            title={props.translate('common.settings')}
            shouldShowBackButton
            onBackButtonPress={() => Navigation.goBack()}
            onCloseButtonPress={() => Navigation.dismissModal(true)}
        />
        <ScrollView style={styles.flex1}>
            <View style={[styles.m5]}>
                <NotificationPreferences report={props.report} />
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
