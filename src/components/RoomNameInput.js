import PropTypes from 'prop-types';
import React from 'react';
import useLocalize from '@hooks/useLocalize';
import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import refPropTypes from './refPropTypes';
import TextInput from './TextInput';

const propTypes = {
    /** Callback to execute when the text input is modified correctly */
    onChangeText: PropTypes.func,

    /** Room name to show in input field. This should include the '#' already prefixed to the name */
    value: PropTypes.string,

    /** Whether we should show the input as disabled */
    disabled: PropTypes.bool,

    /** Error text to show */
    errorText: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))]),

    /** A ref forwarded to the TextInput */
    forwardedRef: refPropTypes,

    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string.isRequired,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** AutoFocus */
    autoFocus: PropTypes.bool,

    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    /** Whether navigation is focused */
    isFocused: PropTypes.bool.isRequired,

    roomName: PropTypes.string,
};

const defaultProps = {
    onChangeText: () => {},
    value: '',
    disabled: false,
    errorText: '',
    forwardedRef: () => {},

    onBlur: () => {},
    autoFocus: false,
    shouldDelayFocus: false,
    roomName: '',
};

function RoomNameInput({isFocused, autoFocus, disabled, forwardedRef, onBlur, shouldDelayFocus, ...restProps}) {
    const {translate} = useLocalize();

    const keyboardType = getOperatingSystem() === CONST.OS.IOS ? CONST.KEYBOARD_TYPE.ASCII_CAPABLE : CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD;

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
            onBlur={(event) => isFocused && onBlur(event)}
            shouldDelayFocus={shouldDelayFocus}
            autoFocus={isFocused && autoFocus}
            maxLength={CONST.REPORT.MAX_ROOM_NAME_LENGTH}
            spellCheck={false}
            shouldInterceptSwipe
            keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
        />
    );
}

RoomNameInput.propTypes = propTypes;
RoomNameInput.defaultProps = defaultProps;
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
