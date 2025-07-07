"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function SavedSearchItemThreeDotMenu(_a) {
    var menuItems = _a.menuItems, isDisabledItem = _a.isDisabledItem, hideProductTrainingTooltip = _a.hideProductTrainingTooltip, renderTooltipContent = _a.renderTooltipContent, shouldRenderTooltip = _a.shouldRenderTooltip;
    var threeDotsMenuContainerRef = (0, react_1.useRef)(null);
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var calculateAndSetThreeDotsMenuPosition = (0, react_1.useCallback)(function () {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({ horizontal: 0, vertical: 0 });
        }
        return new Promise(function (resolve) {
            var _a;
            (_a = threeDotsMenuContainerRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width) {
                resolve({
                    horizontal: x + width,
                    vertical: y,
                });
            });
        });
    }, [shouldUseNarrowLayout]);
    return (<react_native_1.View ref={threeDotsMenuContainerRef} style={[isDisabledItem && styles.pointerEventsNone]}>
            <ThreeDotsMenu_1.default menuItems={menuItems} getAnchorPosition={calculateAndSetThreeDotsMenuPosition} renderProductTrainingTooltipContent={renderTooltipContent} shouldShowProductTrainingTooltip={shouldRenderTooltip} anchorAlignment={{
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }} iconStyles={styles.wAuto} hideProductTrainingTooltip={hideProductTrainingTooltip}/>
        </react_native_1.View>);
}
exports.default = SavedSearchItemThreeDotMenu;
