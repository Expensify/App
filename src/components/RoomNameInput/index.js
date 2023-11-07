import React from 'react';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as RoomNameInputUtils from '@libs/RoomNameInputUtils';
import CONST from '@src/CONST';
import _ from 'underscore';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import InputWrapper from "@components/Form/InputWrapper";
import getOperatingSystem from "@libs/getOperatingSystem";

function RoomNameInput({isFocused, autoFocus, disabled, errorText, forwardedRef, onBlur, shouldDelayFocus, inputID, roomName}) {
    const {translate} = useLocalize();

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

    const valueParser = (roomName) => RoomNameInputUtils.modifyRoomName(roomName);
    const displayParser = (roomName) =>  RoomNameInputUtils.modifyRoomName(roomName, true);

    return (
        <InputWrapper
            InputComponent={TextInput}
            inputID={inputID}
            ref={forwardedRef}
            disabled={disabled}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            role={CONST.ACCESSIBILITY_ROLE.TEXT}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={translate('newRoomPage.social')}
            errorText={errorText}
            valueParser={valueParser}
            displayParser={displayParser}
            autoCapitalize="none"
            onBlur={() => isFocused && onBlur()}
            shouldDelayFocus={shouldDelayFocus}
            autoFocus={isFocused && autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            defaultValue={roomName}
            spellCheck={false}
            shouldInterceptSwipe
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
        />
    );
}

RoomNameInput.propTypes = roomNameInputPropTypes.propTypes;
RoomNameInput.defaultProps = roomNameInputPropTypes.defaultProps;
RoomNameInput.displayName = 'RoomNameInput';

const RoomNameInputWithRef = React.forwardRef((props, ref) => (
    <RoomNameInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));

RoomNameInputWithRef.displayName = 'RoomNameInputWithRef';

export default RoomNameInputWithRef;
