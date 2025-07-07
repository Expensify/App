"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FloatingActionButtonAndPopover_1 = require("@pages/home/sidebar/FloatingActionButtonAndPopover");
function NavigationTabBarFloatingActionButton(_a) {
    var isTooltipAllowed = _a.isTooltipAllowed;
    var popoverModal = (0, react_1.useRef)(null);
    /**
     * Method to hide popover when dragover.
     */
    var hidePopoverOnDragOver = (0, react_1.useCallback)(function () {
        if (!popoverModal.current) {
            return;
        }
        popoverModal.current.hideCreateMenu();
    }, []);
    /**
     * Method create event listener
     */
    var createDragoverListener = function () {
        document.addEventListener('dragover', hidePopoverOnDragOver);
    };
    /**
     * Method remove event listener.
     */
    var removeDragoverListener = function () {
        document.removeEventListener('dragover', hidePopoverOnDragOver);
    };
    return (<FloatingActionButtonAndPopover_1.default ref={popoverModal} isTooltipAllowed={isTooltipAllowed} onShowCreateMenu={createDragoverListener} onHideCreateMenu={removeDragoverListener}/>);
}
exports.default = NavigationTabBarFloatingActionButton;
