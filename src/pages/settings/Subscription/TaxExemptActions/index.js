"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@userActions/Report");
var Subscription_1 = require("@userActions/Subscription");
var CONST_1 = require("@src/CONST");
var anchorAlignment = {
    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};
function TaxExemptActions() {
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var threeDotsMenuContainerRef = (0, react_1.useRef)(null);
    var overflowMenu = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons.Coins,
            numberOfLinesTitle: 2,
            text: translate('subscription.details.taxExempt'),
            onSelected: function () {
                (0, Subscription_1.requestTaxExempt)();
                (0, Report_1.navigateToConciergeChat)();
            },
        },
    ]; }, [translate]);
    var calculateAndSetThreeDotsMenuPosition = (0, react_1.useCallback)(function () {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({ horizontal: 0, vertical: 0 });
        }
        return new Promise(function (resolve) {
            var _a;
            (_a = threeDotsMenuContainerRef.current) === null || _a === void 0 ? void 0 : _a.measureInWindow(function (x, y, width, height) {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);
    return (<react_native_1.View ref={threeDotsMenuContainerRef} style={[styles.mtn2, styles.pAbsolute, styles.rn3]}>
            <ThreeDotsMenu_1.default getAnchorPosition={calculateAndSetThreeDotsMenuPosition} menuItems={overflowMenu} anchorAlignment={anchorAlignment} shouldOverlay/>
        </react_native_1.View>);
}
TaxExemptActions.displayName = 'TaxExemptActions';
exports.default = TaxExemptActions;
