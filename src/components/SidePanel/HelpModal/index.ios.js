"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Modal_1 = require("@components/Modal");
var HelpContent_1 = require("@components/SidePanel/HelpComponents/HelpContent");
var CONST_1 = require("@src/CONST");
function Help(_a) {
    var shouldHideSidePanel = _a.shouldHideSidePanel, closeSidePanel = _a.closeSidePanel;
    return (<Modal_1.default onClose={function () { return closeSidePanel(); }} isVisible={!shouldHideSidePanel} type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} shouldHandleNavigationBack propagateSwipe swipeDirection={CONST_1.default.SWIPE_DIRECTION.RIGHT}>
            <HelpContent_1.default closeSidePanel={closeSidePanel}/>
        </Modal_1.default>);
}
Help.displayName = 'Help';
exports.default = Help;
