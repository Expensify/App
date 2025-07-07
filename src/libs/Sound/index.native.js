"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOUNDS = void 0;
exports.clearSoundAssetsCache = clearSoundAssetsCache;
var react_native_sound_1 = require("react-native-sound");
var BaseSound_1 = require("./BaseSound");
Object.defineProperty(exports, "SOUNDS", { enumerable: true, get: function () { return BaseSound_1.SOUNDS; } });
var config_1 = require("./config");
var playSound = function (soundFile) {
    var sound = new react_native_sound_1.default("".concat(config_1.default.prefix).concat(soundFile, ".mp3"), react_native_sound_1.default.MAIN_BUNDLE, function (error) {
        if (error || (0, BaseSound_1.getIsMuted)()) {
            return;
        }
        sound.play();
    });
};
function clearSoundAssetsCache() { }
exports.default = (0, BaseSound_1.withMinimalExecutionTime)(playSound, 300);
