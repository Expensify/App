"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = usePreferredEmojiSkinTone;
var react_1 = require("react");
var OnyxProvider_1 = require("@components/OnyxProvider");
var User = require("@userActions/User");
function usePreferredEmojiSkinTone() {
    var preferredSkinTone = (0, react_1.useContext)(OnyxProvider_1.PreferredEmojiSkinToneContext);
    var updatePreferredSkinTone = (0, react_1.useCallback)(function (skinTone) {
        if (Number(preferredSkinTone) === Number(skinTone)) {
            return;
        }
        User.updatePreferredSkinTone(skinTone);
    }, [preferredSkinTone]);
    return [preferredSkinTone, updatePreferredSkinTone];
}
