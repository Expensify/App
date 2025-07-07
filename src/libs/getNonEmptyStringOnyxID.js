"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getNonEmptyStringOnyxID;
/** Make sure the id is not an empty string as it can break an onyx key */
function getNonEmptyStringOnyxID(onyxID) {
    // The onyx ID is used inside the onyx key. If it's an empty string, onyx will return
    // a collection instead of an individual item, which is not an expected behaviour.
    return onyxID !== '' ? onyxID : undefined;
}
