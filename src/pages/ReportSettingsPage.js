import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, Keyboard} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import Navigation from '../libs/Navigation/Navigation';
import * as Report from '../libs/actions/Report';
import * as Policy from '../libs/actions/Policy';
import * as ReportUtils from '../libs/ReportUtils';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';
import RoomNameInput from '../components/RoomNameInput';
import Picker from '../components/Picker';
import * as ValidationUtils from '../libs/ValidationUtils';
import OfflineWithFeedback from '../components/OfflineWithFeedback';
import reportPropTypes from './reportPropTypes';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import Form from '../components/Form';
import FullPageNotFoundView from '../components/BlockingViews/FullPageNotFoundView';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/settings */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,

    /* Onyx Props */

    /** The active report */
    report: reportPropTypes.isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** ID of the policy */
        id: PropTypes.string,
    }).isRequired,
};

class ReportSettingsPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
    }

    getNotificationPreferenceOptions() {
        return [
            {value: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, label: this.props.translate('notificationPreferences.immediately')},
            {value: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY, label: this.props.translate('notificationPreferences.daily')},
            {value: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE, label: this.props.translate('notificationPreferences.mute')},
        ];
    }

    /**
     * @param {Object|null} linkedWorkspace - the workspace the report is on, null if the user isn't a member of the workspace
     * @returns {Boolean}
     */
    shouldDisableRename(linkedWorkspace) {
        if (ReportUtils.isDefaultRoom(this.props.report) || ReportUtils.isArchivedRoom(this.props.report)) {
            return true;
        }

        // The remaining checks only apply to public rooms
        if (!ReportUtils.isPublicRoom(this.props.report)) {
            return false;
        }

        // if the linked workspace is null, that means the person isn't a member of the workspace the report is in
        // which means this has to be a public room we want to disable renaming for
        if (!linkedWorkspace) {
            return true;
        }

        // If there is a linked workspace, that means the user is a member of the workspace the report is in.
        // Still, we only want policy owners and admins to be able to modify the name.
        return !Policy.isPolicyOwner(linkedWorkspace) && linkedWorkspace.role !== CONST.POLICY.ROLE.ADMIN;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    updatePolicyRoomName(values) {
        Keyboard.dismiss();

        // When the room name has not changed, skip the Form submission
        if (values.newRoomName === this.props.report.reportName) {
            return;
        }
        Report.updatePolicyRoomName(this.props.report, values.newRoomName);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
        if (values.newRoomName === this.props.report.reportName) {
            return errors;
        }

        // The following validations are ordered by precedence.
        // First priority: We error if the user doesn't enter a room name or left blank
        if (!values.newRoomName || values.newRoomName === CONST.POLICY.ROOM_PREFIX) {
            errors.newRoomName = this.props.translate('newRoomPage.pleaseEnterRoomName');
        } else if (ValidationUtils.isReservedRoomName(values.newRoomName)) {
            // Second priority: Certain names are reserved for default rooms and should not be used for policy rooms.
            errors.newRoomName = this.props.translate('newRoomPage.roomNameReservedError');
        } else if (ValidationUtils.isExistingRoomName(values.newRoomName, this.props.reports, this.props.report.policyID)) {
            // Third priority: Show error if the room name already exists
            errors.newRoomName = this.props.translate('newRoomPage.roomAlreadyExistsError');
        } else if (!ValidationUtils.isValidRoomName(values.newRoomName)) {
            // Fourth priority: We error if the room name has invalid characters
            errors.newRoomName = this.props.translate('newRoomPage.roomNameInvalidError');
        }

        return errors;
    }

    render() {
        const shouldShowRoomName = !ReportUtils.isPolicyExpenseChat(this.props.report);
        const linkedWorkspace = _.find(this.props.policies, policy => policy && policy.id === this.props.report.policyID);
        const shouldDisableRename = this.shouldDisableRename(linkedWorkspace);

        return (
            <ScreenWrapper>
                <FullPageNotFoundView shouldShow={_.isEmpty(this.props.report)}>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.settings')}
                        shouldShowBackButton
                        onBackButtonPress={Navigation.goBack}
                        onCloseButtonPress={Navigation.dismissModal}
                    />
                    <Form
                        formID={ONYXKEYS.FORMS.ROOM_SETTINGS_FORM}
                        submitButtonText={this.props.translate('common.save')}
                        style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                        validate={this.validate}
                        onSubmit={values => !shouldDisableRename && this.updatePolicyRoomName(values)}
                        scrollContextEnabled
                        isSubmitButtonVisible={shouldShowRoomName && !shouldDisableRename}
                        enabledWhenOffline
                    >
                        <View>
                            <View style={[styles.mt2]}>
                                <Picker
                                    label={this.props.translate('notificationPreferences.label')}
                                    onInputChange={(notificationPreference) => {
                                        if (this.props.report.notificationPreference === notificationPreference) {
                                            return;
                                        }

                                        Report.updateNotificationPreference(
                                            this.props.report.reportID,
                                            this.props.report.notificationPreference,
                                            notificationPreference,
                                        );
                                    }}
                                    items={this.getNotificationPreferenceOptions()}
                                    value={this.props.report.notificationPreference}
                                />
                            </View>
                        </View>
                        {shouldShowRoomName && (
                            <View style={styles.mt4}>
                                <OfflineWithFeedback
                                    pendingAction={lodashGet(this.props.report, 'pendingFields.reportName', null)}
                                    errors={lodashGet(this.props.report, 'errorFields.reportName', null)}
                                    onClose={() => Report.clearPolicyRoomNameErrors(this.props.report.reportID)}
                                >
                                    <View style={[styles.flexRow]}>
                                        <View style={[styles.flex3]}>
                                            {shouldDisableRename ? (
                                                <View>
                                                    <Text style={[styles.textLabelSupporting, styles.lh16, styles.mb1]} numberOfLines={1}>
                                                        {this.props.translate('newRoomPage.roomName')}
                                                    </Text>
                                                    <Text numberOfLines={1} style={[styles.optionAlternateText]}>
                                                        {this.props.report.reportName}
                                                    </Text>
                                                </View>
                                            )
                                                : (
                                                    <RoomNameInput
                                                        inputID="newRoomName"
                                                        defaultValue={this.props.report.reportName}
                                                    />
                                                )}
                                        </View>
                                    </View>
                                </OfflineWithFeedback>
                            </View>
                        )}
                        {linkedWorkspace && (
                            <View style={[styles.mt4]}>
                                <Text style={[styles.textLabelSupporting, styles.lh16, styles.mb1]} numberOfLines={1}>
                                    {this.props.translate('workspace.common.workspace')}
                                </Text>
                                <Text numberOfLines={1} style={[styles.optionAlternateText]}>
                                    {linkedWorkspace.name}
                                </Text>
                            </View>
                        )}
                        {this.props.report.visibility && (
                            <View style={[styles.mt4]}>
                                <Text style={[styles.textLabelSupporting, styles.lh16, styles.mb1]} numberOfLines={1}>
                                    {this.props.translate('newRoomPage.visibility')}
                                </Text>
                                <Text numberOfLines={1} style={[styles.reportSettingsVisibilityText]}>
                                    {this.props.translate(`newRoomPage.visibilityOptions.${this.props.report.visibility}`)}
                                </Text>
                                <Text style={[styles.textLabelSupporting, styles.mt1]}>
                                    {
                                        this.props.report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED
                                            ? this.props.translate('newRoomPage.restrictedDescription')
                                            : this.props.translate('newRoomPage.privateDescription')
                                    }
                                </Text>
                            </View>
                        )}
                    </Form>
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
}

ReportSettingsPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withReportOrNotFound,
    withOnyx({
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(ReportSettingsPage);
