"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var uniqueID_1 = require("@components/VideoPlayerContexts/PlaybackContext/uniqueID");
var BaseVideoPlayer_1 = require("./BaseVideoPlayer");
function VideoPlayer(props) {
    var fakeReportID = (0, uniqueID_1.default)().fakeReportID;
    var reportID = props.reportID;
    return (<BaseVideoPlayer_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} reportID={reportID !== null && reportID !== void 0 ? reportID : fakeReportID}/>);
}
VideoPlayer.displayName = 'VideoPlayer';
exports.default = VideoPlayer;
