import React from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import TextInput from '../TextInput';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';
import getOperatingSystem from '../../libs/getOperatingSystem';

function RoomNameInput({autoFocus, disabled, errorText, forwardedRef, value, onBlur, onChangeText, onInputChange, shouldDelayFocus}) {
    const {translate} = useLocalize();

    /**
     * Calls the onChangeText callback with a modified room name
     * @param {Event} event
     */
    const setModifiedRoomName = (event) => {
        const roomName = event.nativeEvent.text;
        const modifiedRoomName = RoomNameInputUtils.modifyRoomName(roomName);
        onChangeText(modifiedRoomName);

        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (_.isFunction(onInputChange)) {
            onInputChange(modifiedRoomName);
        }
    };

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

    return (
        <TextInput
            ref={forwardedRef}
            disabled={disabled}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={translate('newRoomPage.social')}
            onChange={setModifiedRoomName}
            value={value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            errorText={errorText}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
            onBlur={onBlur}
            autoFocus={autoFocus}
            autoCapitalize="none"
            shouldDelayFocus={shouldDelayFocus}
        />
    );
}

RoomNameInput.propTypes = roomNameInputPropTypes.propTypes;
RoomNameInput.defaultProps = roomNameInputPropTypes.defaultProps;
RoomNameInput.displayName = 'RoomNameInput';

export default React.forwardRef((props, ref) => (
    <RoomNameInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        forwardedRef={ref}
    />
));
