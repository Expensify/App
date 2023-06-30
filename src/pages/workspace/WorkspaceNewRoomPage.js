import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import RoomNameInput from '../../components/RoomNameInput';
import Picker from '../../components/Picker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Text from '../../components/Text';
import Permissions from '../../libs/Permissions';
import Log from '../../libs/Log';
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import Form from '../../components/Form';
import shouldDelayFocus from '../../libs/shouldDelayFocus';
import policyMemberPropType from '../policyMemberPropType';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** The report type */
        type: PropTypes.string,

        /** ID of the policy */
        policyID: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The list of policies the user has access to. */
    policies: PropTypes.objectOf(
        PropTypes.shape({
            /** The policy type */
            type: PropTypes.oneOf(_.values(CONST.POLICY.TYPE)),

            /** The name of the policy */
            name: PropTypes.string,

            /** The ID of the policy */
            id: PropTypes.string,
        }),
    ),

    /** A collection of objects for all policies which key policy member objects by accountIDs */
    allPolicyMembers: PropTypes.objectOf(PropTypes.objectOf(policyMemberPropType)),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    reports: {},
    policies: {},
    allPolicyMembers: {},
};

class WorkspaceNewRoomPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            visibilityDescription: this.props.translate('newRoomPage.restrictedDescription'),
        };

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
        this.updateVisibilityDescription = this.updateVisibilityDescription.bind(this);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit({policyID, roomName, visibility, writeCapability}) {
        const policyMembers = _.map(_.keys(this.props.allPolicyMembers[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policyID}`]), (accountID) => Number(accountID));
        Report.addPolicyReport(policyID, roomName, visibility, policyMembers, writeCapability);
    }

    /**
     * @param {String} visibility - form input value passed by the Form component
     */
    updateVisibilityDescription(visibility) {
        const visibilityDescription = this.props.translate(`newRoomPage.${visibility}Description`);
        if (visibilityDescription === this.state.visibilityDescription) {
            return;
        }
        this.setState({visibilityDescription});
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate({policyID, roomName}) {
        const errors = {};

        if (!roomName || roomName === CONST.POLICY.ROOM_PREFIX) {
            // We error if the user doesn't enter a room name or left blank
            ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.pleaseEnterRoomName');
        } else if (roomName !== CONST.POLICY.ROOM_PREFIX && !ValidationUtils.isValidRoomName(roomName)) {
            // We error if the room name has invalid characters
            ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomNameInvalidError');
        } else if (ValidationUtils.isReservedRoomName(roomName)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            ErrorUtils.addErrorMessage(errors, 'roomName', ['newRoomPage.roomNameReservedError', {reservedName: roomName}]);
        } else if (ValidationUtils.isExistingRoomName(roomName, this.props.reports, policyID)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            ErrorUtils.addErrorMessage(errors, 'roomName', 'newRoomPage.roomAlreadyExistsError');
        }

        if (!policyID) {
            errors.policyID = 'newRoomPage.pleaseSelectWorkspace';
        }

        return errors;
    }

    render() {
        if (!Permissions.canUsePolicyRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on policy rooms beta');
            Navigation.dismissModal();
            return null;
        }

        const writeCapabilityOptions = _.map(CONST.REPORT.WRITE_CAPABILITIES, (value) => ({
            value,
            label: this.props.translate(`writeCapabilityPage.writeCapability.${value}`),
        }));

        // Workspaces are policies with type === 'free'
        const workspaceOptions = _.map(
            _.filter(this.props.policies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE),
            (policy) => ({label: policy.name, key: policy.id, value: policy.id}),
        );

        const visibilityOptions = _.map(
            _.filter(_.values(CONST.REPORT.VISIBILITY), (visibilityOption) => visibilityOption !== CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE),
            (visibilityOption) => ({
                label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
                value: visibilityOption,
                description: this.props.translate(`newRoomPage.${visibilityOption}Description`),
            }),
        );

        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnablePickerAvoiding={false}
            >
                <HeaderWithBackButton title={this.props.translate('newRoomPage.newRoom')} />
                <Form
                    formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                    submitButtonText={this.props.translate('newRoomPage.createRoom')}
                    scrollContextEnabled
                    style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                    validate={this.validate}
                    onSubmit={this.submit}
                    enabledWhenOffline
                >
                    <View style={styles.mb5}>
                        <RoomNameInput
                            inputID="roomName"
                            autoFocus
                            shouldDelayFocus={shouldDelayFocus}
                        />
                    </View>
                    <View style={styles.mb2}>
                        <Picker
                            inputID="writeCapability"
                            label={this.props.translate('writeCapabilityPage.label')}
                            items={writeCapabilityOptions}
                            defaultValue={CONST.REPORT.WRITE_CAPABILITIES.ALL}
                        />
                    </View>
                    <View style={styles.mb2}>
                        <Picker
                            inputID="policyID"
                            label={this.props.translate('workspace.common.workspace')}
                            placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                            items={workspaceOptions}
                        />
                    </View>
                    <View style={styles.mb2}>
                        <Picker
                            inputID="visibility"
                            label={this.props.translate('newRoomPage.visibility')}
                            items={visibilityOptions}
                            onValueChange={this.updateVisibilityDescription}
                            defaultValue={CONST.REPORT.VISIBILITY.RESTRICTED}
                        />
                    </View>
                    <Text style={[styles.textLabel, styles.colorMuted]}>{this.state.visibilityDescription}</Text>
                </Form>
            </ScreenWrapper>
        );
    }
}

WorkspaceNewRoomPage.propTypes = propTypes;
WorkspaceNewRoomPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        allPolicyMembers: {
            key: ONYXKEYS.COLLECTION.POLICY_MEMBERS,
        },
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
