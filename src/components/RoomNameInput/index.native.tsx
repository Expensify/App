import type {ForwardedRef} from 'react';
import React from 'react';
import type {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import getOperatingSystem from '@libs/getOperatingSystem';
import * as RoomNameInputUtils from '@libs/RoomNameInputUtils';
import CONST from '@src/CONST';
import type RoomNameInputProps from './types';

function RoomNameInput({
    isFocused,
    autoFocus,
    disabled,
    errorText,
    forwardedRef,
    value,
    onBlur,
    onChangeText,
    onInputChange,
    onSubmitEditing,
    returnKeyType,
    shouldDelayFocus,
    inputID,
}: RoomNameInputProps) {
    const {translate} = useLocalize();

    /**
     * Calls the onChangeText callback with a modified room name
     * @param event
     */
    const setModifiedRoomName = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = RoomNameInputUtils.modifyRoomName(roomName);
        onChangeText?.(modifiedRoomName);

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (typeof onInputChange === 'function') {
            onInputChange(modifiedRoomName);
        }
    };

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

    return (
        <TextInput
            ref={forwardedRef}
            disabled={disabled}
            inputID={inputID}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            role={CONST.ROLE.PRESENTATION}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={translate('newRoomPage.social')}
            onChange={setModifiedRoomName}
            value={value?.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            errorText={errorText}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
            onBlur={(event) => isFocused && onBlur?.(event)}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            autoFocus={isFocused && autoFocus}
            autoCapitalize="none"
            shouldDelayFocus={shouldDelayFocus}
        />
    );
}

RoomNameInput.displayName = 'RoomNameInput';

function RoomNameInputWithRef(props: Omit<RoomNameInputProps, 'forwardedRef'>, ref: ForwardedRef<BaseTextInputRef>) {
    return (
        <RoomNameInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    );
}

RoomNameInputWithRef.displayName = 'RoomNameInputWithRef';

export default React.forwardRef(RoomNameInputWithRef);
