"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOUNDS = void 0;
exports.clearSoundAssetsCache = clearSoundAssetsCache;
var howler_1 = require("howler");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var BaseSound_1 = require("./BaseSound");
Object.defineProperty(exports, "SOUNDS", { enumerable: true, get: function () { return BaseSound_1.SOUNDS; } });
var config_1 = require("./config");
function cacheSoundAssets() {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        return;
    }
    // If this is Desktop app, Cache API wont work with app scheme
    if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.DESKTOP) {
        return;
    }
    caches.open('sound-assets').then(function (cache) {
        var soundFiles = Object.values(BaseSound_1.SOUNDS).map(function (sound) { return "".concat(config_1.default.prefix).concat(sound, ".mp3"); });
        // Cache each sound file if it's not already cached.
        var cachePromises = soundFiles.map(function (soundFile) {
            return cache.match(soundFile).then(function (response) {
                if (response) {
                    return;
                }
                return cache.add(soundFile);
            });
        });
        return Promise.all(cachePromises);
    });
}
var initializeAndPlaySound = function (src) {
    var sound = new howler_1.Howl({
        src: [src],
        format: ['mp3'],
        onloaderror: function (_id, error) {
            Log_1.default.alert('[sound] Load error:', { message: error.message });
        },
        onplayerror: function (_id, error) {
            Log_1.default.alert('[sound] Play error:', { message: error.message });
        },
    });
    sound.play();
};
var playSound = function (soundFile) {
    if ((0, BaseSound_1.getIsMuted)()) {
        return;
    }
    var soundSrc = "".concat(config_1.default.prefix).concat(soundFile, ".mp3");
    if (!('caches' in window)) {
        // Fallback to fetching from network if not in cache
        initializeAndPlaySound(soundSrc);
        return;
    }
    caches.open('sound-assets').then(function (cache) {
        cache.match(soundSrc).then(function (response) {
            if (response) {
                response.blob().then(function (soundBlob) {
                    var soundUrl = URL.createObjectURL(soundBlob);
                    initializeAndPlaySound(soundUrl);
                });
                return;
            }
            initializeAndPlaySound(soundSrc);
        });
    });
};
function clearSoundAssetsCache() {
    // Exit early if the Cache API is not available in the current browser.
    if (!('caches' in window)) {
        return;
    }
    caches
        .delete('sound-assets')
        .then(function (success) {
        if (success) {
            return;
        }
        Log_1.default.alert('[sound] Failed to clear sound assets cache.');
    })
        .catch(function (error) {
        Log_1.default.alert('[sound] Error clearing sound assets cache:', { message: error.message });
    });
}
// Cache sound assets on load
cacheSoundAssets();
exports.default = (0, BaseSound_1.withMinimalExecutionTime)(playSound, 300);
