import React, {forwardRef, useState} from 'react';
import _ from 'underscore';
import CONST from '../../CONST';
import withLocalize from '../withLocalize';
import TextInput from '../TextInput';
import * as roomNameInputPropTypes from './roomNameInputPropTypes';
import * as RoomNameInputUtils from '../../libs/RoomNameInputUtils';

const RoomNameInput = forwardRef((props, ref) => {
    const [selection, setSelection] = useState();

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

        // Prevent cursor jump behaviour:
        // Check if newRoomNameWithHash is the same as modifiedRoomName
        // If it is then the room name is valid (does not contain unallowed characters); no action required
        // If not then the room name contains unvalid characters and we must adjust the cursor position manually
        // Read more: https://github.com/Expensify/App/issues/12741
        const oldRoomNameWithHash = props.value || '';
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
            ref={ref}
            disabled={props.disabled}
            label={props.translate('newRoomPage.roomName')}
            accessibilityLabel={props.translate('newRoomPage.roomName')}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
            prefixCharacter={CONST.POLICY.ROOM_PREFIX}
            placeholder={props.translate('newRoomPage.social')}
            onChange={setModifiedRoomName}
            value={props.value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
            selection={selection}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            errorText={props.errorText}
            autoCapitalize="none"
            onBlur={props.onBlur}
            autoFocus={props.autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
        />
    );
});

RoomNameInput.propTypes = roomNameInputPropTypes.propTypes;
RoomNameInput.defaultProps = roomNameInputPropTypes.defaultProps;

export default withLocalize(RoomNameInput);
