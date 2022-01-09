import React from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from './withFullPolicy';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import styles from '../../styles/styles';
import TextInputWithLabel from '../../components/TextInputWithLabel';
import Picker from '../../components/Picker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import * as Report from '../../libs/actions/Report';
import Permissions from '../../libs/Permissions';
import Log from '../../libs/Log';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportName: PropTypes.string,
        type: PropTypes.string,
        policyID: PropTypes.string,
    }).isRequired,

    /** Are we loading the createPolicyRoom command */
    isLoadingCreatePolicyRoom: PropTypes.bool,

    ...fullPolicyPropTypes,

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    isLoadingCreatePolicyRoom: false,
    ...fullPolicyDefaultProps,
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
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
        this.clearErrorAndSetValue = this.clearErrorAndSetValue.bind(this);
        this.checkAndModifyRoomName = this.checkAndModifyRoomName.bind(this);
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

    /**
     * Called when the onSubmit() method is triggered.
     * which validates the form fields.
     */
    validate() {
        const roomName = this.state.roomName.trim();
        const policyID = this.state.policyID;
        const visibility = this.state.visibility;
        const errors = {};

        if (!roomName || roomName === '#') {
            errors.roomName = 'Please enter a room name';
        } else if (
            policyID &&
            this.checkAndModifyRoomName(roomName).isExistingRoomName
        ) {
            errors.roomName = this.props.translate('newRoomPage.roomAlreadyExists');
        } else {
            errors.roomName = '';
        }

        if (!policyID) {
            errors.policyID = 'Please select a workspace';
        } else {
            errors.policyID = '';
        }

        if (!visibility) {
            errors.visibility = 'Please select a visibility';
        } else {
            errors.visibility = '';
        }

        if (!errors.roomName && !errors.policyID && !errors.visibility) {
            this.setState({errors: {}});
            return true;
        }

        this.setState((prevState) => ({
            errors: {...prevState.errors, ...errors},
        }));
        return false;
    }

    /**
     * Called when the "Create Room" button is pressed.
     */
    onSubmit() {
        if (this.validate()) {
            Report.createPolicyRoom(
                this.state.policyID, 
                this.state.roomName, 
                this.state.visibility
            )
        };
    }

    /**
     * Clear the errors associated to inputKey if found and store the inputKey new value in the state.
     *
     * @param {String} inputKey
     * @param {String} value
     */
    clearErrorAndSetValue(inputKey, value) {
        this.setState((prevState) => ({
            [inputKey]: value,
            errors: {
                ...prevState.errors,
                [inputKey]: false,
            },
        }));
    }

    /**
     * Modifies the room name to follow our conventions:
     * - Max length 80 characters
     * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
     * - Must be lowercase
     * provides the modified room name and a boolean indicating if the room name is already existing or not.
     * @param {String} roomName
     *
     * @returns {Object} data
     * @returns {String} data.modifiedRoomName
     * @returns {Boolean} data.isExistingRoomName
     */
    checkAndModifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName.substr(1)
            .replace(/ /g, '_')
            .replace(/[^a-zA-Z\d_]/g, '')
            .substr(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
            .toLowerCase();
        const modifiedRoomName = `#${modifiedRoomNameWithoutHash}`;

        const isExistingRoomName = _.some(
            _.values(this.props.reports),
            report => report && report.policyID === this.state.policyID && 
            report.reportName === modifiedRoomName,
        );

        return {modifiedRoomName, isExistingRoomName};
    }

    render() {
        if (!Permissions.canUseDefaultRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on default rooms beta');
            Navigation.dismissModal();
            return null;
        }

        const visibilityOptions = _.map(_.values(CONST.REPORT.VISIBILITY), visibilityOption => ({
            label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
        }));

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('newRoomPage.newRoom')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <TextInputWithLabel
                            label={this.props.translate('newRoomPage.roomName')}
                            prefixCharacter="#"
                            placeholder={this.props.translate('newRoomPage.social')}
                            containerStyles={[styles.mb5]}
                            onChangeText={roomName => this.clearErrorAndSetValue('roomName', this.checkAndModifyRoomName(roomName).modifiedRoomName)}
                            value={this.state.roomName.substr(1)}
                            errorText={this.state.errors.roomName || ''}
                            autoCapitalize="none"
                        />
                        <View style={styles.mb5}>
                            <Picker
                                value={this.state.policyID}
                                label={this.props.translate('workspace.common.workspace')}
                                placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                                items={this.state.workspaceOptions}
                                errorText={this.state.errors.policyID || ''}
                                onChange={(policyID) => this.clearErrorAndSetValue('policyID', policyID)}
                            />
                        </View>
                        <Picker
                            value={this.state.visibility}
                            label={this.props.translate('newRoomPage.visibility')}
                            items={visibilityOptions}
                            errorText={this.state.errors.visibility || ''}
                            onChange={visibility => this.clearErrorAndSetValue('visibility', visibility)}
                        />
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            isLoading={this.props.isLoadingCreatePolicyRoom}
                            success
                            onPress={this.onSubmit}
                            style={[styles.w100]}
                            text={this.props.translate('newRoomPage.createRoom')}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

WorkspaceNewRoomPage.propTypes = propTypes;
WorkspaceNewRoomPage.defaultProps = defaultProps;

export default compose(
    withFullPolicy,
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
        isLoadingCreatePolicyRoom: {
            key: ONYXKEYS.IS_LOADING_CREATE_POLICY_ROOM,
        },
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
