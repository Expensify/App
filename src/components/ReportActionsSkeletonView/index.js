"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
var SkeletonViewLines_1 = require("./SkeletonViewLines");
function ReportActionsSkeletonView(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, _c = _a.possibleVisibleContentItems, possibleVisibleContentItems = _c === void 0 ? 0 : _c;
    var contentItems = possibleVisibleContentItems || Math.ceil(react_native_1.Dimensions.get('screen').height / CONST_1.default.CHAT_SKELETON_VIEW.AVERAGE_ROW_HEIGHT);
    var skeletonViewLines = [];
    for (var index = 0; index < contentItems; index++) {
        var iconIndex = (index + 1) % 4;
        switch (iconIndex) {
            case 2:
                skeletonViewLines.push(<SkeletonViewLines_1.default shouldAnimate={shouldAnimate} numberOfRows={2} key={"skeletonViewLines".concat(index)}/>);
                break;
            case 0:
                skeletonViewLines.push(<SkeletonViewLines_1.default shouldAnimate={shouldAnimate} numberOfRows={3} key={"skeletonViewLines".concat(index)}/>);
                break;
            default:
                skeletonViewLines.push(<SkeletonViewLines_1.default shouldAnimate={shouldAnimate} numberOfRows={1} key={"skeletonViewLines".concat(index)}/>);
        }
    }
    return <react_native_1.View>{skeletonViewLines}</react_native_1.View>;
}
ReportActionsSkeletonView.displayName = 'ReportActionsSkeletonView';
exports.default = ReportActionsSkeletonView;
