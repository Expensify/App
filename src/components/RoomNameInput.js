import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withFullPolicy, {fullPolicyDefaultProps, fullPolicyPropTypes} from '../pages/workspace/withFullPolicy';
import TextInput from './TextInput';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Initial room name to show in input field. This should include the '#' already prefixed to the name */
    initialValue: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** Error text to show */
    errorText: PropTypes.string,

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
    initialValue: '',
    disabled: false,
    errorText: '',
    ...fullPolicyDefaultProps,
};

class RoomNameInput extends Component {
    constructor(props) {
        super(props);

        this.setModifiedRoomName = this.setModifiedRoomName.bind(this);
    }

    /**
     * Calls the onChangeText callback with a modified room name
     * @param {Event} event
     */
    setModifiedRoomName(event) {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = this.modifyRoomName(roomName);
        this.props.onChangeText(modifiedRoomName);
    }

    /**
     * Modifies the room name to follow our conventions:
     * - Max length 80 characters
     * - Cannot not include space or special characters, and we automatically apply an underscore for spaces
     * - Must be lowercase
     * @param {String} roomName
     * @returns {String}
     */
    modifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName
            .replace(/ /g, '_')
            .replace(/[^a-zA-Z\d_]/g, '')
            .substr(0, CONST.REPORT.MAX_ROOM_NAME_LENGTH)
            .toLowerCase();

        return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
    }

    render() {
        return (
            <TextInput
                disabled={this.props.disabled}
                label={this.props.translate('newRoomPage.roomName')}
                prefixCharacter={CONST.POLICY.ROOM_PREFIX}
                placeholder={this.props.translate('newRoomPage.social')}
                onChange={this.setModifiedRoomName}
                defaultValue={this.props.initialValue.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
                errorText={this.props.errorText}
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
