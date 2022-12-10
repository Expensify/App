import React from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import RoomNameInput from '../../components/RoomNameInput';
import Picker from '../../components/Picker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Text from '../../components/Text';
import Permissions from '../../libs/Permissions';
import Log from '../../libs/Log';
import * as ValidationUtils from '../../libs/ValidationUtils';
import Form from '../../components/Form';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** The report type */
        type: PropTypes.string,

        /** ID of the policy */
        policyID: PropTypes.string,
    }).isRequired,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
};

class WorkspaceNewRoomPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomName: '',
            policyID: '',
            visibilityDescription: this.props.translate('newRoomPage.restrictedDescription'),
            errors: {},
        };

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
        this.updateVisibilityDescription = this.updateVisibilityDescription.bind(this);
    }

    updateVisibilityDescription(visibility) {
        const visibilityDescription = this.props.translate(`newRoomPage.${visibility}Description`);
        this.setState({visibilityDescription});
    }

    validate(values) {
        const errors = {};
        console.log(values);
        this.updateVisibilityDescription(values.visibility);

        // We error if the user doesn't enter a room name or left blank
        if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
            errors.roomName = this.props.translate('newRoomPage.pleaseEnterRoomName');
        }

        // We error if the room name already exists.
        if (ValidationUtils.isExistingRoomName(values.roomName, this.props.reports, values.workspace)) {
            errors.roomName = this.props.translate('newRoomPage.roomAlreadyExistsError');
        }

        // Certain names are reserved for default rooms and should not be used for policy rooms.
        if (ValidationUtils.isReservedRoomName(values.roomName)) {
            errors.roomName = this.props.translate('newRoomPage.roomNameReservedError');
        }

        // We error if the user doesn't select a workspace
        if (!values.workspace) {
            errors.workspace = this.props.translate('newRoomPage.pleaseSelectWorkspace');
        }

        return errors;
    }

    submit(values) {
        const policyID = this.props.policies[`${ONYXKEYS.COLLECTION.POLICY}${values.workspace}`];
        Report.addPolicyReport(policyID, values.roomName, values.visibility);
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
        if (!Permissions.canUsePolicyRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on policy rooms beta');
            Navigation.dismissModal();
            return null;
        }

        const workspaces = _.filter(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);
        const workspaceOptions = _.map(workspaces, policy => ({label: policy.name, key: policy.id, value: policy.id}));
        const visibilityOptions = _.map(_.values(CONST.REPORT.VISIBILITY), visibilityOption => ({
            label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
            description: this.props.translate(`newRoomPage.${visibilityOption}Description`),
        }));

        return (
            <>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.newRoom')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <Form
                    formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                    submitButtonText={this.props.translate('newRoomPage.createRoom')}
                    style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                    validate={this.validate}
                    onSubmit={this.submit}
                    enabledWhenOffline
                >
                    <View style={styles.mb5}>
                        <RoomNameInput
                            inputID="roomName"
                            policyID={this.state.policyID}
                            errorText={this.state.errors.roomName}
                            onChangeText={roomName => this.clearErrorAndSetValue('roomName', roomName)}
                            value={this.state.roomName}
                        />
                    </View>
                    <View style={styles.mb5}>
                        <Picker
                            inputID="workspace"
                            label={this.props.translate('workspace.common.workspace')}
                            items={workspaceOptions}
                            placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                        />
                    </View>
                    <View style={styles.mb2}>
                        <Picker
                            inputID="visibility"
                            label={this.props.translate('newRoomPage.visibility')}
                            items={visibilityOptions}
                            defaultValue={CONST.REPORT.VISIBILITY.RESTRICTED}
                        />
                    </View>
                    <Text style={[styles.textLabel, styles.colorMuted]}>
                        {this.state.visibilityDescription}
                    </Text>
                </Form>
            </>
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
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
