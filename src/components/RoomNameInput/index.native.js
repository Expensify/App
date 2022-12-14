import React, {Component} from 'react';
import CONST from '../../CONST';
import withLocalize from '../withLocalize';
import TextInput from '../TextInput';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';

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
        const modifiedRoomName = RoomNameInputUtils.modifyRoomName(roomName);
        this.props.onChangeText(modifiedRoomName);
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
                maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            />
        );
    }
}

RoomNameInput.propTypes = roomNameInputPropTypes.propTypes;
RoomNameInput.defaultProps = roomNameInputPropTypes.defaultProps;

export default withLocalize(
    React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
        <RoomNameInput {...props} forwardedRef={ref} />
    )),
);
