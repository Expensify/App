import React from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from './withFullPolicy';
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
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import Permissions from '../../libs/Permissions';
import Log from '../../libs/Log';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import * as ValidationUtils from '../../libs/ValidationUtils';

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

        this.validateAndCreatePolicyRoom = this.validateAndCreatePolicyRoom.bind(this);
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

    validateAndCreatePolicyRoom() {
        if (!this.validate()) {
            return;
        }
        Report.createPolicyRoom(
            this.state.policyID,
            this.state.roomName,
            this.state.visibility,
        );
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

    render() {
        if (!Permissions.canUseDefaultRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on default rooms beta');
            Navigation.dismissModal();
            return null;
        }

        const visibilityOptions = _.map(_.values(CONST.REPORT.VISIBILITY), visibilityOption => ({
            label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
            description: this.props.translate(`newRoomPage.${visibilityOption}Description`),
        }));

        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('newRoomPage.newRoom')}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <View style={styles.mb5}>
                            <RoomNameInput
                                policyID={this.state.policyID}
                                errorText={this.state.errors.roomName}
                                onChangeText={roomName => this.clearErrorAndSetValue('roomName', roomName)}
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
                    </ScrollView>
                    <FixedFooter>
                        <Button
                            isLoading={this.props.isLoadingCreatePolicyRoom}
                            success
                            pressOnEnter
                            onPress={this.validateAndCreatePolicyRoom}
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
