"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserSearchPhrase = clearUserSearchPhrase;
exports.updateUserSearchPhrase = updateUserSearchPhrase;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function clearUserSearchPhrase() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, '');
}
/**
 * Persists user search phrase from the search input across the screens.
 */
function updateUserSearchPhrase(value) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, value);
}
