import React from 'react';
import {View} from 'react-native';
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
import ExpensiPicker from '../../components/ExpensiPicker';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Button from '../../components/Button';
import FixedFooter from '../../components/FixedFooter';
import {createPolicyRoom} from '../../libs/actions/Report';

const propTypes = {
    /** All reports shared with the user */
    reports: PropTypes.shape({
        reportName: PropTypes.string,
        type: PropTypes.string,
        policyID: PropTypes.string,
    }).isRequired,

    ...fullPolicyPropTypes,

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    ...fullPolicyDefaultProps,
};

class WorkspaceNewRoomPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            roomName: '',
            policyID: '',
            visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
            isLoading: false,
            error: '',
            workspaceOptions: [],
        };
        this.onWorkspaceSelect = this.onWorkspaceSelect.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.checkAndModifyRoomName = this.checkAndModifyRoomName.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.policies.length === prevProps.policies.length) {
            return;
        }
        const workspaces = _.filter(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE);

        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({workspaceOptions: _.map(workspaces, policy => ({label: policy.name, key: policy.id, value: policy.id}))});
    }

    onWorkspaceSelect(policyID) {
        this.setState({policyID});
        this.checkAndModifyRoomName(this.state.roomName);
    }

    onSubmit() {
        this.setState({isLoading: true});
        createPolicyRoom(this.state.policyID, this.state.roomName, this.state.visibility)
            .then(() => this.setState({isLoading: false}));
    }

    /**
     * Modifies the room name to follow our conventions:
     * - Max length 80 characters
     * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
     * - Must be lowercase
     * Also checks to see if this room name already exists, and displays an error message if so.
     * @param {String} roomName
     *
     * @returns {String}
     */
    checkAndModifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName.substr(1)
            .replace(/ /g, '_')
            .replace(/[^a-zA-Z\d_]/g, '')
            .substr(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
            .toLowerCase();
        const finalRoomName = `#${modifiedRoomNameWithoutHash}`;

        const isExistingRoomName = _.some(
            _.values(this.props.reports),
            report => report.policyID === this.state.policyID && report.reportName === finalRoomName,
        );
        if (isExistingRoomName) {
            this.setState({error: this.props.translate('newRoomPage.roomAlreadyExists')});
        } else {
            this.setState({error: ''});
        }
        return finalRoomName;
    }

    render() {
        const shouldDisableSubmit = Boolean(!this.state.roomName || !this.state.policyID || this.state.error);
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate('newRoomPage.newRoom')}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <View style={[styles.flex1, styles.w100, styles.pRelative, styles.p5]}>
                    <TextInputWithLabel
                        label={this.props.translate('newRoomPage.roomName')}
                        prefixCharacter="#"
                        placeholder={this.props.translate('newRoomPage.social')}
                        containerStyles={[styles.mb5]}
                        onChangeText={roomName => this.setState({roomName: this.checkAndModifyRoomName(roomName)})}
                        value={this.state.roomName.substr(1)}
                        errorText={this.state.error}
                    />
                    <ExpensiPicker
                        value={this.state.policyID}
                        label={this.props.translate('workspace.common.workspace')}
                        placeholder={{value: '', label: this.props.translate('newRoomPage.selectAWorkspace')}}
                        items={this.state.workspaceOptions}
                        onChange={this.onWorkspaceSelect}
                        containerStyles={[styles.mb5]}
                    />
                    <ExpensiPicker
                        value={CONST.REPORT.VISIBILITY.RESTRICTED}
                        label={this.props.translate('newRoomPage.visibility')}
                        items={[
                            {label: 'Restricted', value: CONST.REPORT.VISIBILITY.RESTRICTED},
                            {label: 'Private', value: CONST.REPORT.VISIBILITY.PRIVATE},
                        ]}
                        onChange={visibility => this.setState({visibility})}
                    />
                </View>
                <FixedFooter>
                    <Button
                        isLoading={this.state.isLoading}
                        isDisabled={shouldDisableSubmit}
                        success
                        onPress={this.onSubmit}
                        style={[styles.w100]}
                        text={this.props.translate('newRoomPage.createRoom')}
                    />
                </FixedFooter>
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
    }),
    withLocalize,
)(WorkspaceNewRoomPage);
