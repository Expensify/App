"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var RoomNameInputUtils_1 = require("@libs/RoomNameInputUtils");
var CONST_1 = require("@src/CONST");
function RoomNameInput(_a, ref) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.autoFocus, autoFocus = _c === void 0 ? false : _c, isFocused = _a.isFocused, value = _a.value, onBlur = _a.onBlur, onChangeText = _a.onChangeText, onInputChange = _a.onInputChange, props = __rest(_a, ["disabled", "autoFocus", "isFocused", "value", "onBlur", "onChangeText", "onInputChange"]);
    var translate = (0, useLocalize_1.default)().translate;
    /**
     * Calls the onChangeText callback with a modified room name
     */
    var setModifiedRoomName = function (event) {
        var roomName = event.nativeEvent.text;
        var modifiedRoomName = (0, RoomNameInputUtils_1.modifyRoomName)(roomName);
        onChangeText === null || onChangeText === void 0 ? void 0 : onChangeText(modifiedRoomName);
        // if custom component has onInputChange, use it to trigger changes (Form input)
        if (typeof onInputChange === 'function') {
            onInputChange(modifiedRoomName);
        }
    };
    var keyboardType = (0, getOperatingSystem_1.default)() === CONST_1.default.OS.IOS ? CONST_1.default.KEYBOARD_TYPE.ASCII_CAPABLE : CONST_1.default.KEYBOARD_TYPE.VISIBLE_PASSWORD;
    return (<TextInput_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} disabled={disabled} label={translate('newRoomPage.roomName')} accessibilityLabel={translate('newRoomPage.roomName')} role={CONST_1.default.ROLE.PRESENTATION} prefixCharacter={CONST_1.default.POLICY.ROOM_PREFIX} placeholder={translate('newRoomPage.social')} value={value === null || value === void 0 ? void 0 : value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
     onBlur={function (event) { return isFocused && (onBlur === null || onBlur === void 0 ? void 0 : onBlur(event)); }} autoFocus={isFocused && autoFocus} autoCapitalize="none" onChange={setModifiedRoomName} keyboardType={keyboardType} // this is a bit hacky solution to a RN issue https://github.com/facebook/react-native/issues/27449
    />);
}
RoomNameInput.displayName = 'RoomNameInput';
exports.default = react_1.default.forwardRef(RoomNameInput);
