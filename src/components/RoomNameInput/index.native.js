import React, {Component} from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import withLocalize from '../withLocalize';
import TextInput from '../TextInput';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';
import getOperatingSystem from '../../libs/getOperatingSystem';

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

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (_.isFunction(this.props.onInputChange)) {
            this.props.onInputChange(modifiedRoomName);
        }
    }

    render() {
        const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;
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
                maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
                keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
                onBlur={this.props.onBlur}
                autoFocus={this.props.autoFocus}
                autoCapitalize="none"
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
