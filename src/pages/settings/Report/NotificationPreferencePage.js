import React, {Component} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import TextInput from '../../../components/TextInput';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import compose from '../../../libs/compose';
import * as RoomNameInputUtils from '../../../libs/RoomNameInputUtils';
import withReportOrNotFound from '../../home/report/withReportOrNotFound';
import reportPropTypes from '../../reportPropTypes';
import ROUTES from '../../../ROUTES';
import * as Report from '../../../libs/actions/Report';

const propTypes = {
    ...withLocalizePropTypes,

    /* Onyx Props */
    /** The active report */
    report: reportPropTypes.isRequired,
};

class NotificationPreferencePage extends Component {
    constructor(props) {
        super(props);
        this.updateNotificationPreference = this.updateNotificationPreference.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * Submit form to update room's name
     * @param {Object} values
     * @param {String} values.notificationPreference
     */
    updateNotificationPreference(values) {
        Report.updateNotificationPreference(
            this.props.report.reportID,
            this.props.report.notificationPreference,
            values.notificationPreference,
        );
        Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(this.props.report.reportID));
    }

    render() {
        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('notificationPreferences.header')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.drawerGoBack(ROUTES.getReportSettingsRoute(this.props.report.reportID))}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.NOTIFICATION_PREFERENCES_FORM}
                    onSubmit={this.updateNotificationPreference}
                    validate={this.validate}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="notificationPreferences"
                            name="preferences"
                            label={this.props.translate('notificationPreferences.label')}
                            value={this.props.report.notificationPreference}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

NotificationPreferencePage.propTypes = propTypes;

export default compose(
    withLocalize,
    withReportOrNotFound,
)(NotificationPreferencePage);
