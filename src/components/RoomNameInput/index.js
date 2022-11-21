import React, {Component} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import TextInput from '../TextInput';

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
        this.setSelection = this.setSelection.bind(this);

        this.state = {
            selection: {start: 0, end: 0},
        };
    }

    /**
     * Calls the onChangeText callback with a modified room name
     * @param {Event} event
     */
    setModifiedRoomName(event) {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = this.modifyRoomName(roomName);
        this.props.onChangeText(modifiedRoomName);

        // Prevent cursor jump behaviour:
        // Check if newRoomNameWithHash is the same as modifiedRoomName
        // If it is then the room name is valid (does not contain unallowed characters); no action required
        // If not then the room name contains unvalid characters and we must adjust the cursor position manually
        // Read more: https://github.com/Expensify/App/issues/12741
        const oldRoomNameWithHash = this.props.value || '';
        const newRoomNameWithHash = `${CONST.POLICY.ROOM_PREFIX}${roomName}`;
        if (modifiedRoomName !== newRoomNameWithHash) {
            const offset = modifiedRoomName.length - oldRoomNameWithHash.length;
            const selection = {
                start: this.state.selection.start + offset,
                end: this.state.selection.end + offset,
            }
            this.setSelection(selection);
        }
    }

    /**
     * Set the selection
     * @param {Object} selection
     */
    setSelection(selection) {
        this.setState({
            selection: selection,
        });
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
                ref={this.props.forwardedRef}
                disabled={this.props.disabled}
                label={this.props.translate('newRoomPage.roomName')}
                prefixCharacter={CONST.POLICY.ROOM_PREFIX}
                placeholder={this.props.translate('newRoomPage.social')}
                onChange={this.setModifiedRoomName}
                value={this.props.value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
                selection={this.state.selection}
                onSelectionChange={(event) => this.setSelection(event.nativeEvent.selection)}
                errorText={this.props.errorText}
                autoCapitalize="none"
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
