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
var uniqueID_1 = require("@components/VideoPlayerContexts/PlaybackContext/uniqueID");
var CONST_1 = require("@src/CONST");
var BaseVideoPlayer_1 = require("./BaseVideoPlayer");
function VideoPlayer(_a) {
    var videoControlsStyle = _a.videoControlsStyle, _b = _a.shouldUseControlsBottomMargin, shouldUseControlsBottomMargin = _b === void 0 ? true : _b, props = __rest(_a, ["videoControlsStyle", "shouldUseControlsBottomMargin"]);
    var fakeReportID = (0, uniqueID_1.default)().fakeReportID;
    var reportID = props.reportID;
    return (<BaseVideoPlayer_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} isVideoHovered shouldUseSharedVideoElement={false} videoControlsStyle={[shouldUseControlsBottomMargin ? { bottom: CONST_1.default.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE } : undefined, videoControlsStyle]} reportID={reportID !== null && reportID !== void 0 ? reportID : fakeReportID}/>);
}
VideoPlayer.displayName = 'VideoPlayer';
exports.default = VideoPlayer;
