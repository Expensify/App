import React, {useState} from 'react';
import _ from 'underscore';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import getOperatingSystem from '@libs/getOperatingSystem';
import * as RoomNameInputUtils from '@libs/RoomNameInputUtils';
import CONST from '@src/CONST';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';

function RoomNameInput({value, isFocused, autoFocus, disabled, forwardedRef, onBlur, shouldDelayFocus, onChangeText, onInputChange, ...restProps}) {
    const {translate} = useLocalize();

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;
    const [selection, setSelection] = useState();

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

        // Prevent cursor jump behaviour:
        // Check if newRoomNameWithHash is the same as modifiedRoomName
        // If it is then the room name is valid (does not contain unallowed characters); no action required
        // If not then the room name contains unvalid characters and we must adjust the cursor position manually
        // Read more: https://github.com/Expensify/App/issues/12741
        const oldRoomNameWithHash = value || '';
        const newRoomNameWithHash = `${CONST.POLICY.ROOM_PREFIX}${roomName}`;
        if (modifiedRoomName !== newRoomNameWithHash) {
            const offset = modifiedRoomName.length - oldRoomNameWithHash.length;
            const newSelection = {
                start: selection.start + offset,
                end: selection.end + offset,
            };
            setSelection(newSelection);
        }
    };
    return (
        <TextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ref={forwardedRef}
            disabled={disabled}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            role={CONST.ACCESSIBILITY_ROLE.TEXT}
            placeholder={translate('newRoomPage.social')}
            autoCapitalize="none"
            value={value.substring(1)}
            onChange={setModifiedRoomName}
            selection={selection}
            onBlur={(event) => isFocused && onBlur(event)}
            shouldDelayFocus={shouldDelayFocus}
            autoFocus={isFocused && autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
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
