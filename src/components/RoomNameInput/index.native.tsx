import React from 'react';
import type {TextInputChangeEvent} from 'react-native';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import getOperatingSystem from '@libs/getOperatingSystem';
import {modifyRoomName} from '@libs/RoomNameInputUtils';
import CONST from '@src/CONST';
import type RoomNameInputProps from './types';

function RoomNameInput({disabled = false, autoFocus = false, isFocused, value, onBlur, onChangeText, onInputChange, ref, ...props}: RoomNameInputProps) {
    const {translate} = useLocalize();

    /**
     * Calls the onChangeText callback with a modified room name
     */
    const setModifiedRoomName = (event: TextInputChangeEvent) => {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = modifyRoomName(roomName);
        onChangeText?.(modifiedRoomName);

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (typeof onInputChange === 'function') {
            onInputChange(modifiedRoomName);
        }
    };

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            disabled={disabled}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            role={CONST.ROLE.PRESENTATION}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={translate('newRoomPage.social')}
            value={value?.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            onBlur={(event) => isFocused && onBlur?.(event)}
            autoFocus={isFocused && autoFocus}
            autoCapitalize="none"
            onChange={setModifiedRoomName}
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
        />
    );
}

export default RoomNameInput;
