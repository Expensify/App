import React, {useState} from 'react';
import type {ForwardedRef} from 'react';
import type {NativeSyntheticEvent, TextInputChangeEventData} from 'react-native';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as RoomNameInputUtils from '@libs/RoomNameInputUtils';
import type {BaseTextInputRef} from '@src/components/TextInput/BaseTextInput/types';
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
    const [selection, setSelection] = useState<{start: number; end: number}>({start: 0, end: 0});

    /**
     * Calls the onChangeText callback with a modified room name
     */
    const setModifiedRoomName = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = RoomNameInputUtils.modifyRoomName(roomName);
        onChangeText?.(modifiedRoomName);

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (typeof onInputChange === 'function') {
            onInputChange(modifiedRoomName);
        }

        // Prevent cursor jump behaviour:
        // Check if newRoomNameWithHash is the same as modifiedRoomName
        // If it is, then the room name is valid (does not contain forbidden characters) – no action required
        // If not, then the room name contains invalid characters, and we must adjust the cursor position manually
        // Read more: https://github.com/Expensify/App/issues/12741
        const oldRoomNameWithHash = value ?? '';
        const newRoomNameWithHash = `${CONST.POLICY.ROOM_PREFIX}${roomName}`;
        if (modifiedRoomName !== newRoomNameWithHash) {
            const offset = modifiedRoomName.length - oldRoomNameWithHash.length;
            const newCursorPosition = selection.end + offset;
            setSelection({start: newCursorPosition, end: newCursorPosition});
        }
    };

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
            selection={selection}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            onSubmitEditing={onSubmitEditing}
            returnKeyType={returnKeyType}
            errorText={errorText}
            autoCapitalize="none"
            onBlur={(event) => isFocused && onBlur?.(event)}
            shouldDelayFocus={shouldDelayFocus}
            autoFocus={isFocused && autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            spellCheck={false}
            shouldInterceptSwipe
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
