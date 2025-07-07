"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Visibility_1 = require("@libs/Visibility");
function usePlaybackContextVideoRefs(resetCallback) {
    var currentVideoPlayerRef = (0, react_1.useRef)(null);
    var videoResumeTryNumberRef = (0, react_1.useRef)(0);
    var playVideoPromiseRef = (0, react_1.useRef)(undefined);
    var isPlayPendingRef = (0, react_1.useRef)(false);
    var pauseVideo = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a, { shouldPlay: false });
    }, [currentVideoPlayerRef]);
    var stopVideo = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a, { shouldPlay: false, positionMillis: 0 });
    }, [currentVideoPlayerRef]);
    var playVideo = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (!Visibility_1.default.isVisible()) {
            isPlayPendingRef.current = true;
            return;
        }
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.getStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a).then(function (status) {
            var _a;
            var newStatus = { shouldPlay: true };
            if ('durationMillis' in status && status.durationMillis === status.positionMillis) {
                newStatus.positionMillis = 0;
            }
            playVideoPromiseRef.current = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.setStatusAsync(newStatus).catch(function (error) {
                return error;
            });
        });
    }, [currentVideoPlayerRef]);
    var unloadVideo = (0, react_1.useCallback)(function () {
        var _a, _b;
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.unloadAsync) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, [currentVideoPlayerRef]);
    var checkIfVideoIsPlaying = (0, react_1.useCallback)(function (statusCallback) {
        var _a, _b;
        (_b = (_a = currentVideoPlayerRef.current) === null || _a === void 0 ? void 0 : _a.getStatusAsync) === null || _b === void 0 ? void 0 : _b.call(_a).then(function (status) {
            statusCallback('isPlaying' in status && status.isPlaying);
        });
    }, [currentVideoPlayerRef]);
    var resetVideoPlayerData = (0, react_1.useCallback)(function () {
        var _a;
        // Play video is an async operation and if we call stop video before the promise is completed,
        // it will throw a console error. So, we'll wait until the promise is resolved before stopping the video.
        ((_a = playVideoPromiseRef.current) !== null && _a !== void 0 ? _a : Promise.resolve()).then(stopVideo).finally(function () {
            videoResumeTryNumberRef.current = 0;
            resetCallback();
            unloadVideo();
            currentVideoPlayerRef.current = null;
        });
    }, [resetCallback, stopVideo, unloadVideo]);
    (0, react_1.useEffect)(function () {
        return Visibility_1.default.onVisibilityChange(function () {
            if (!Visibility_1.default.isVisible() || !isPlayPendingRef.current) {
                return;
            }
            playVideo();
            isPlayPendingRef.current = false;
        });
    }, [playVideo]);
    var updateCurrentVideoPlayerRef = function (ref) {
        currentVideoPlayerRef.current = ref;
    };
    return (0, react_1.useMemo)(function () { return ({
        resetPlayerData: resetVideoPlayerData,
        isPlaying: checkIfVideoIsPlaying,
        pause: pauseVideo,
        play: playVideo,
        ref: currentVideoPlayerRef,
        resumeTryNumberRef: videoResumeTryNumberRef,
        updateRef: updateCurrentVideoPlayerRef,
    }); }, [checkIfVideoIsPlaying, pauseVideo, playVideo, resetVideoPlayerData]);
}
exports.default = usePlaybackContextVideoRefs;
