import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import TextInput from './TextInput';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Room name to show in input field. This should include the '#' already prefixed to the name */
    value: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** Error text to show */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,

    /** A ref forwarded to the TextInput */
    forwardedRef: PropTypes.func,
};

const defaultProps = {
    onChangeText: () => {},
    value: '',
    disabled: false,
    errorText: '',
    forwardedRef: () => {},
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
     * Modifies the room name in the following ways:
     * - Automatically replaces spaces with underscore
     * - Automatically replaces uppercase letters with lowercase
     * @param {String} roomName
     * @returns {String}
     */
    modifyRoomName(roomName) {
        const modifiedRoomNameWithoutHash = roomName
            .replace(/ /g, '_')
            .toLowerCase();

        return `${CONST.POLICY.ROOM_PREFIX}${modifiedRoomNameWithoutHash}`;
    }

    render() {
        return (
            <TextInput
                ref={this.props.forwardedRef}
                disabled={this.props.disabled}
                label={this.props.translate('newRoomPage.roomName')}
                prefixCharacter={CONST.POLICY.ROOM_PREFIX}
                placeholder={this.props.translate('newRoomPage.social')}
                onChange={this.setModifiedRoomName}
                value={this.props.value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
                errorText={this.props.errorText}
                autoCapitalize="none"
                maxLength={80}
            />
        );
    }
}

RoomNameInput.propTypes = propTypes;
RoomNameInput.defaultProps = defaultProps;

export default withLocalize(
    React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <RoomNameInput {...props} forwardedRef={ref} />
    )),
);
