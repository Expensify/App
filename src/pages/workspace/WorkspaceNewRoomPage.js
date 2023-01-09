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
            visibilityDescription: this.props.translate('newRoomPage.restrictedDescription'),
        };

        this.validate = this.validate.bind(this);
        this.submit = this.submit.bind(this);
        this.updateVisibilityDescription = this.updateVisibilityDescription.bind(this);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit(values) {
        const policyID = this.props.policies[`${ONYXKEYS.COLLECTION.POLICY}${values.policyID}`];
        Report.addPolicyReport(policyID, values.roomName, values.visibility);
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
    validate(values) {
        const errors = {};

        // The following validations are ordered by precedence.
        // First priority: We error if the user doesn't enter a room name or left blank
        if (!values.roomName || values.roomName === CONST.POLICY.ROOM_PREFIX) {
            errors.roomName = this.props.translate('newRoomPage.pleaseEnterRoomName');
        } else if (ValidationUtils.isReservedRoomName(values.roomName)) {
            // Second priority: Certain names are reserved for default rooms and should not be used for policy rooms.
            errors.roomName = this.props.translate('newRoomPage.roomNameReservedError');
        } else if (ValidationUtils.isExistingRoomName(values.roomName, this.props.reports, values.policyID)) {
            // Third priority: We error if the room name already exists.
            errors.roomName = this.props.translate('newRoomPage.roomAlreadyExistsError');
        } else if (!ValidationUtils.isValidRoomName(values.roomName)) {
            // Fourth priority: We error if the room name has invalid characters
            errors.roomName = this.props.translate('newRoomPage.roomNameInvalidError');
        }

        if (!values.policyID) {
            errors.policyID = this.props.translate('newRoomPage.pleaseSelectWorkspace');
        }

        return errors;
    }

    render() {
        if (!Permissions.canUsePolicyRooms(this.props.betas)) {
            Log.info('Not showing create Policy Room page since user is not on policy rooms beta');
            Navigation.dismissModal();
            return null;
        }

        // Workspaces are policies with type === 'free'
        const workspaceOptions = _.map(
            _.filter(this.props.policies, policy => policy && policy.type === CONST.POLICY.TYPE.FREE),
            policy => ({label: policy.name, key: policy.id, value: policy.id}),
        );

        const visibilityOptions = _.map(_.values(CONST.REPORT.VISIBILITY), visibilityOption => ({
            label: this.props.translate(`newRoomPage.visibilityOptions.${visibilityOption}`),
            value: visibilityOption,
            description: this.props.translate(`newRoomPage.${visibilityOption}Description`),
        }));

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
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
                            autoFocus
                        />
                    </View>
                    <View style={styles.mb5}>
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
                    <Text style={[styles.textLabel, styles.colorMuted]}>
                        {this.state.visibilityDescription}
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
