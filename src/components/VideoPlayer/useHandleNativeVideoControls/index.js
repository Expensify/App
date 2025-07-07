"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
/**
 * Web implementation for managing native video controls.
 * This hook hides the download button on the native video player in full-screen mode
 * when playing a local or offline video.
 */
var useHandleNativeVideoControls = function (_a) {
    var videoPlayerRef = _a.videoPlayerRef, isLocalFile = _a.isLocalFile, isOffline = _a.isOffline;
    (0, react_1.useEffect)(function () {
        var _a, _b, _c;
        // @ts-expect-error Property '_video' does not exist on type VideoWithOnFullScreenUpdate
        // eslint-disable-next-line no-underscore-dangle
        var videoElement = (_c = (_b = (_a = videoPlayerRef === null || videoPlayerRef === void 0 ? void 0 : videoPlayerRef.current) === null || _a === void 0 ? void 0 : _a._nativeRef) === null || _b === void 0 ? void 0 : _b.current) === null || _c === void 0 ? void 0 : _c._video;
        if (!videoElement) {
            return;
        }
        if (isOffline || isLocalFile) {
            videoElement.setAttribute('controlsList', 'nodownload');
        }
        else {
            videoElement.removeAttribute('controlsList');
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOffline, isLocalFile]);
};
exports.default = useHandleNativeVideoControls;
