"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var VideoPlayer_1 = require("@components/VideoPlayer");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function AttachmentViewVideo(_a) {
    var source = _a.source, _b = _a.isHovered, isHovered = _b === void 0 ? false : _b, _c = _a.shouldUseSharedVideoElement, shouldUseSharedVideoElement = _c === void 0 ? false : _c, _d = _a.duration, duration = _d === void 0 ? 0 : _d, reportID = _a.reportID;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    return (<VideoPlayer_1.default url={source} shouldUseSharedVideoElement={shouldUseSharedVideoElement && !shouldUseNarrowLayout} isVideoHovered={isHovered} videoDuration={duration} style={[styles.w100, styles.h100, styles.pb5]} reportID={reportID}/>);
}
AttachmentViewVideo.displayName = 'AttachmentViewVideo';
exports.default = react_1.default.memo(AttachmentViewVideo);
