"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PopoverMenu_1 = require("@components/PopoverMenu");
var VideoPopoverMenuContext_1 = require("@components/VideoPlayerContexts/VideoPopoverMenuContext");
function VideoPopoverMenu(_a) {
    var _b = _a.isPopoverVisible, isPopoverVisible = _b === void 0 ? false : _b, _c = _a.hidePopover, hidePopover = _c === void 0 ? function () { } : _c, _d = _a.anchorPosition, anchorPosition = _d === void 0 ? {
        horizontal: 0,
        vertical: 0,
    } : _d;
    var menuItems = (0, VideoPopoverMenuContext_1.useVideoPopoverMenuContext)().menuItems;
    var videoPlayerMenuRef = (0, react_1.useRef)(null);
    return (<PopoverMenu_1.default onClose={hidePopover} onItemSelected={hidePopover} isVisible={isPopoverVisible} anchorPosition={anchorPosition} menuItems={menuItems} anchorRef={videoPlayerMenuRef} shouldUseScrollView/>);
}
VideoPopoverMenu.displayName = 'VideoPopoverMenu';
exports.default = VideoPopoverMenu;
