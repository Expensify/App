import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from '../pages/workspace/withFullPolicy';
import TextInputWithPrefix from './TextInputWithPrefix';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Callback to execute when an error gets found/cleared/modified */
    onChangeError: PropTypes.func,

    /** Initial room name to show in input field. This should include the '#' already prefixed to the name */
    initialValue: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** ID of policy whose room names we should be checking for duplicates */
    policyID: PropTypes.string,

    ...withLocalizePropTypes,
    ...fullPolicyPropTypes,

    /* Onyx Props */

    /** All reports shared with the user */
    reports: PropTypes.shape({
        /** The report name */
        reportName: PropTypes.string,

        /** ID of the report */
        reportID: PropTypes.number,
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
    onChangeText: () => {},
    onChangeError: () => {},
    initialValue: '',
    disabled: false,
    policyID: '',
    ...fullPolicyDefaultProps,
};

class RoomNameInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomName: props.initialValue,
            error: '',
        };

        this.originalRoomName = props.initialValue;

        this.checkAndModifyRoomName = this.checkAndModifyRoomName.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        // As we are modifying the text input, we'll bubble up any changes/errors so the parent component can see it
        if (prevState.roomName !== this.state.roomName) {
            this.props.onChangeText(this.state.roomName);
        }
        if (prevState.error !== this.state.error) {
            this.props.onChangeError(this.state.error);
        }
    }

    /**
     * Modifies the room name to follow our conventions:
     * - Max length 80 characters
     * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
     * - Must be lowercase
     * Also checks to see if this room name already exists, and displays an error message if so.
     * @param {String} roomName
     *
     */
    checkAndModifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName.substring(1)
            .replace(/ /g, '_')
            .replace(/[^a-zA-Z\d_]/g, '')
            .substring(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
            .toLowerCase();
        const finalRoomName = `#${modifiedRoomNameWithoutHash}`;

        const isExistingRoomName = _.some(
            _.values(this.props.reports),
            report => report && report.policyID === this.props.policyID && report.reportName === finalRoomName,
        );

        let error = '';

        // We error if the room name already exists. We don't care if it matches the original name provided in this
        // component because then we are not changing the room's name.
        if (isExistingRoomName && finalRoomName !== this.originalRoomName) {
            error = this.props.translate('newRoomPage.roomAlreadyExistsError');
        }

        // Certain names are reserved for default rooms and should not be used for policy rooms.
        if (_.contains(CONST.REPORT.RESERVED_ROOM_NAMES, finalRoomName)) {
            error = this.props.translate('newRoomPage.roomNameReservedError');
        }

        this.setState({
            roomName: finalRoomName,
            error,
        });
    }

    render() {
        return (
            <TextInputWithPrefix
                disabled={this.props.disabled}
                label={this.props.translate('newRoomPage.roomName')}
                prefixCharacter="#"
                placeholder={this.props.translate('newRoomPage.social')}
                containerStyles={[styles.mb5]}
                onChangeText={roomName => this.checkAndModifyRoomName(roomName)}
                value={this.state.roomName.substring(1)}
                errorText={this.state.error}
                autoCapitalize="none"
            />
        );
    }
}

RoomNameInput.propTypes = propTypes;
RoomNameInput.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withFullPolicy,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        policies: {
            key: ONYXKEYS.COLLECTION.POLICY,
        },
    }),
)(RoomNameInput);
