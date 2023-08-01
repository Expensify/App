import React, {useState} from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import TextInput from '../TextInput';
import useLocalize from '../../hooks/useLocalize';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';

function RoomNameInput({autoFocus, disabled, errorText, forwardedRef, value, onBlur, onChangeText, onInputChange}) {
    const {translate} = useLocalize();

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
            ref={forwardedRef}
            disabled={disabled}
            label={translate('newRoomPage.roomName')}
            accessibilityLabel={translate('newRoomPage.roomName')}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={translate('newRoomPage.social')}
            onChange={setModifiedRoomName}
            value={value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            selection={selection}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            errorText={errorText}
            autoCapitalize="none"
            onBlur={onBlur}
            autoFocus={autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
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
