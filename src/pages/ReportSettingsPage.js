import React, {Component} from 'react';
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
import * as ReportUtils from '../libs/reportUtils';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import Text from '../components/Text';
import Button from '../components/Button';
import RoomNameInput from '../components/RoomNameInput';
import Picker from '../components/Picker';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from './workspace/withFullPolicy';
import * as ValidationUtils from '../libs/ValidationUtils';
import Growl from '../libs/Growl';

const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Report ID passed via route r/:reportID/settings */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    ...fullPolicyPropTypes,
    ...withLocalizePropTypes,

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

    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** The report type */
        type: PropTypes.string,

        /** ID of the policy */
        policyID: PropTypes.string,
    }).isRequired,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** The policy name */
        name: PropTypes.string,

        /** ID of the policy */
        id: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
    ...fullPolicyDefaultProps,
};

class ReportSettingsPage extends Component {
    constructor(props) {
        super(props);
        this.notificationPreferencesOptions = {
            default: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                label: this.props.translate('notificationPreferences.immediately'),
            },
            daily: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
                label: this.props.translate('notificationPreferences.daily'),
            },
            mute: {
                value: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
                label: this.props.translate('notificationPreferences.mute'),
            },
        };

        this.state = {
            newRoomName: this.props.report.reportName,
            errors: {},
        };

        this.validateAndRenameReport = this.validateAndRenameReport.bind(this);
    }

    validateAndRenameReport() {
        if (!this.validate()) {
            return;
        }
        if (this.props.report.reportName === this.state.newRoomName) {
            Growl.success(this.props.translate('newRoomPage.policyRoomRenamed'));
            return;
        }
        Report.renameReport(this.props.report.reportID, this.state.newRoomName);
    }

    validate() {
        const errors = {};

        // We error if the user doesn't enter a room name or left blank
        if (!this.state.newRoomName || this.state.newRoomName === CONST.POLICY.ROOM_PREFIX) {
            errors.newRoomName = this.props.translate('newRoomPage.pleaseEnterRoomName');
        }

        // We error if the room name already exists. We don't error if the room name matches same as previous.
        if (ValidationUtils.isExistingRoomName(this.state.newRoomName, this.props.reports, this.props.report.policyID) && this.state.newRoomName !== this.props.report.reportName) {
            errors.newRoomName = this.props.translate('newRoomPage.roomAlreadyExistsError');
        }

        // Certain names are reserved for default rooms and should not be used for policy rooms.
        if (ValidationUtils.isReservedRoomName(this.state.newRoomName)) {
            errors.newRoomName = this.props.translate('newRoomPage.roomNameReservedError');
        }

        this.setState({errors});
        return _.isEmpty(errors);
    }

    /**
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setState(prevState => ({
            [inputKey]: value,
            errors: {
                ...prevState.errors,
                [inputKey]: '',
            },
        }));
    }

    render() {
        const shouldShowRename = !ReportUtils.isPolicyExpenseChat(this.props.report);
        const shouldDisableRename = ReportUtils.isDefaultRoom(this.props.report)
            || ReportUtils.isArchivedRoom(this.props.report);
        console.log(shouldDisableRename);
        const linkedWorkspace = _.find(this.props.policies, policy => policy.id === this.props.report.policyID);

        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('common.settings')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                    <View>
                        <View>
                        </View>
                        <View style={[styles.mb5, styles.mt2]}>
                            <Picker
                                label={this.props.translate('notificationPreferences.label')}
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
                    {shouldShowRename && (
                        <View style={styles.mt4}>
                            <View style={[styles.flexRow, styles.mb1]}>
                                <View style={[styles.flex3]}>
                                    <RoomNameInput
                                        initialValue={this.state.newRoomName}
                                        policyID={linkedWorkspace && linkedWorkspace.id}
                                        errorText={this.state.errors.newRoomName}
                                        onChangeText={newRoomName => this.clearErrorAndSetValue('newRoomName', newRoomName)}
                                        disabled={shouldDisableRename}
                                    />
                                </View>
                                {!shouldDisableRename && (
                                    <Button
                                        large
                                        success={!shouldDisableRename}
                                        text={this.props.translate('common.save')}
                                        onPress={this.validateAndRenameReport}
                                        style={[styles.ml2, styles.flex1]}
                                        textStyles={[styles.label]}
                                        innerStyles={[styles.ph5]}
                                        isLoading={this.props.isLoadingRenamePolicyRoom}
                                        isDisabled={shouldDisableRename}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                    {linkedWorkspace && (
                        <View style={[styles.mt4]}>
                            <Text style={[styles.label]} numberOfLines={1}>
                                {this.props.translate('workspace.common.workspace')}
                            </Text>
                            <Text numberOfLines={1}>
                                {linkedWorkspace.name}
                            </Text>
                        </View>
                    )}
                    {this.props.report.visibility && (
                        <View style={[styles.mt4]}>
                            <Text style={[styles.formLabel]} numberOfLines={1}>
                                {this.props.translate('newRoomPage.visibility')}
                            </Text>
                            <Text numberOfLines={1} style={[styles.reportSettingsVisibilityText]}>{this.props.report.visibility}</Text>
                            <Text style={[styles.textLabelSupporting, styles.mt1]}>
                                {
                                    this.props.report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED
                                        ? this.props.translate('newRoomPage.restrictedDescription')
                                        : this.props.translate('newRoomPage.privateDescription')
                                }
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </ScreenWrapper>
        );
    }
}

ReportSettingsPage.propTypes = propTypes;
ReportSettingsPage.defaultProps = defaultProps;
ReportSettingsPage.displayName = 'ReportSettingsPage';

export default compose(
    withLocalize,
    withFullPolicy,
    withOnyx({
        report: {
            key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        isLoadingRenamePolicyRoom: {
            key: ONYXKEYS.IS_LOADING_RENAME_POLICY_ROOM,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
    }),
)(ReportSettingsPage);
