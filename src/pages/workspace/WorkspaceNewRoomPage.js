import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import * as Report from '../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
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
            visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
            errors: {},
            workspaceOptions: [],
        };

        this.validateAndAddPolicyReport = this.validateAndAddPolicyReport.bind(this);
        this.focusRoomNameInput = this.focusRoomNameInput.bind(this);
    }

    componentDidMount() {
        // Workspaces are policies with type === 'free'
        const workspaces = _.filter(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);
        this.setState({workspaceOptions: _.map(workspaces, policy => ({label: policy.name, key: policy.id, value: policy.id}))});
    }

    componentDidUpdate(prevProps) {
        if (this.props.policies.length === prevProps.policies.length) {
            return;
        }

        // Workspaces are policies with type === 'free'
        const workspaces = _.filter(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({workspaceOptions: _.map(workspaces, policy => ({label: policy.name, key: policy.id, value: policy.id}))});
    }

    validateAndAddPolicyReport() {
        if (!this.validate()) {
            return;
        }
        const policy = this.props.policies[`${ONYXKEYS.COLLECTION.POLICY}${this.state.policyID}`];
        Report.addPolicyReport(policy, this.state.roomName, this.state.visibility);
    }

    /**
     * @returns {Boolean}
     */
    validate() {
        const errors = {};

        // We error if the user doesn't enter a room name or left blank
        if (!this.state.roomName || this.state.roomName === CONST.POLICY.ROOM_PREFIX) {
            errors.roomName = this.props.translate('newRoomPage.pleaseEnterRoomName');
        }

        // We error if the room name already exists.
        if (ValidationUtils.isExistingRoomName(this.state.roomName, this.props.reports, this.state.policyID)) {
            errors.roomName = this.props.translate('newRoomPage.roomAlreadyExistsError');
        }

        // Certain names are reserved for default rooms and should not be used for policy rooms.
        if (ValidationUtils.isReservedRoomName(this.state.roomName)) {
            errors.roomName = this.props.translate('newRoomPage.roomNameReservedError');
        }

        if (!this.state.policyID) {
            errors.policyID = this.props.translate('newRoomPage.pleaseSelectWorkspace');
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

    focusRoomNameInput() {
        if (!this.roomNameInputRef) {
            return;
        }

        this.roomNameInputRef.focus();
    }

    render() {
        if (!Permissions.canUsePolicyRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on policy rooms beta');
            Navigation.dismissModal();
            return null;
        }

        const visibilityOptions = _.map(_.values(CONST.REPORT.VISIBILITY), visibilityOption => ({
            label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
            description: this.props.translate(`newRoomPage.${visibilityOption}Description`),
        }));

        return (
            <ScreenWrapper onTransitionEnd={this.focusRoomNameInput}>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.newRoom')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <Form
                    formID={ONYXKEYS.FORMS.NEW_ROOM_FORM}
                    submitButtonText={this.props.translate('newRoomPage.createRoom')}
                    style={[styles.mh5, styles.mt5, styles.flexGrow1]}
                    validate={this.validate}
                    onSubmit={this.validateAndAddPolicyReport}
                    enabledWhenOffline
                >
                    <View style={styles.mb5}>
                        <RoomNameInput
                            ref={el => this.roomNameInputRef = el}
                            policyID={this.state.policyID}
                            errorText={this.state.errors.roomName}
                            onChangeText={roomName => this.clearErrorAndSetValue('roomName', roomName)}
                            value={this.state.roomName}
                        />
                    </View>
                    <View style={styles.mb5}>
                        <Picker
                            value={this.state.policyID}
                            label={this.props.translate('workspace.common.workspace')}
                            placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                            items={this.state.workspaceOptions}
                            errorText={this.state.errors.policyID}
                            onInputChange={policyID => this.clearErrorAndSetValue('policyID', policyID)}
                        />
                    </View>
                    <View style={styles.mb2}>
                        <Picker
                            value={this.state.visibility}
                            label={this.props.translate('newRoomPage.visibility')}
                            items={visibilityOptions}
                            onInputChange={visibility => this.setState({visibility})}
                        />
                    </View>
                    <Text style={[styles.textLabel, styles.colorMuted]}>
                        {_.find(visibilityOptions, option => option.value === this.state.visibility).description}
                    </Text>
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
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
