import React, {forwardRef} from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import withLocalize from '../withLocalize';
import TextInput from '../TextInput';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';
import getOperatingSystem from '../../libs/getOperatingSystem';

const RoomNameInput = forwardRef((props, ref) => {
    /**
     * Calls the onChangeText callback with a modified room name
     * @param {Event} event
     */
    const setModifiedRoomName = (event) => {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = RoomNameInputUtils.modifyRoomName(roomName);
        props.onChangeText(modifiedRoomName);

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (_.isFunction(props.onInputChange)) {
            props.onInputChange(modifiedRoomName);
        }
    };

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

    return (
        <TextInput
            ref={ref}
            disabled={props.disabled}
            label={props.translate('newRoomPage.roomName')}
            accessibilityLabel={props.translate('newRoomPage.roomName')}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={props.translate('newRoomPage.social')}
            onChange={setModifiedRoomName}
            value={props.value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            errorText={props.errorText}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            autoCapitalize="none"
            shouldDelayFocus={props.shouldDelayFocus}
        />
    );
});

RoomNameInput.propTypes = roomNameInputPropTypes.propTypes;
RoomNameInput.defaultProps = roomNameInputPropTypes.defaultProps;

export default withLocalize(RoomNameInput);
