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
var RoomNameInputUtils_1 = require("@libs/RoomNameInputUtils");
var CONST_1 = require("@src/CONST");
function RoomNameInput(_a, ref) {
    var _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.autoFocus, autoFocus = _c === void 0 ? false : _c, isFocused = _a.isFocused, _d = _a.value, value = _d === void 0 ? '' : _d, onBlur = _a.onBlur, onChangeText = _a.onChangeText, onInputChange = _a.onInputChange, props = __rest(_a, ["disabled", "autoFocus", "isFocused", "value", "onBlur", "onChangeText", "onInputChange"]);
    var translate = (0, useLocalize_1.default)().translate;
    var _e = (0, react_1.useState)({ start: value.length - 1, end: value.length - 1 }), selection = _e[0], setSelection = _e[1];
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
        // Prevent cursor jump behaviour:
        // Check if newRoomNameWithHash is the same as modifiedRoomName
        // If it is, then the room name is valid (does not contain forbidden characters) – no action required
        // If not, then the room name contains invalid characters, and we must adjust the cursor position manually
        // Read more: https://github.com/Expensify/App/issues/12741
        var oldRoomNameWithHash = value !== null && value !== void 0 ? value : '';
        var newRoomNameWithHash = "".concat(CONST_1.default.POLICY.ROOM_PREFIX).concat(roomName);
        if (modifiedRoomName !== newRoomNameWithHash) {
            var offset = modifiedRoomName.length - oldRoomNameWithHash.length;
            var newCursorPosition = selection.end + offset;
            setSelection({ start: newCursorPosition, end: newCursorPosition });
        }
    };
    return (<TextInput_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} disabled={disabled} label={translate('newRoomPage.roomName')} accessibilityLabel={translate('newRoomPage.roomName')} role={CONST_1.default.ROLE.PRESENTATION} prefixCharacter={CONST_1.default.POLICY.ROOM_PREFIX} placeholder={translate('newRoomPage.social')} value={value === null || value === void 0 ? void 0 : value.substring(1)} // Since the room name always starts with a prefix, we omit the first character to avoid displaying it twice.
     onBlur={function (event) { return isFocused && (onBlur === null || onBlur === void 0 ? void 0 : onBlur(event)); }} autoFocus={isFocused && autoFocus} autoCapitalize="none" onChange={setModifiedRoomName} onSelectionChange={function (event) { return setSelection(event.nativeEvent.selection); }} selection={selection} spellCheck={false} shouldInterceptSwipe/>);
}
RoomNameInput.displayName = 'RoomNameInput';
exports.default = react_1.default.forwardRef(RoomNameInput);
