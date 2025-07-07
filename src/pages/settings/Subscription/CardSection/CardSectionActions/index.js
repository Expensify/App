"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var ThreeDotsMenu_1 = require("@components/ThreeDotsMenu");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var anchorAlignment = {
    horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
    vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
};
function CardSectionActions() {
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var translate = (0, useLocalize_1.default)().translate;
    var threeDotsMenuContainerRef = (0, react_1.useRef)(null);
    var overflowMenu = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons.CreditCard,
            text: translate('subscription.cardSection.changeCard'),
            onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD); },
        },
        {
            icon: Expensicons.MoneyCircle,
            text: translate('subscription.cardSection.changeCurrency'),
            onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY); },
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
    return (<react_native_1.View ref={threeDotsMenuContainerRef}>
            <ThreeDotsMenu_1.default getAnchorPosition={calculateAndSetThreeDotsMenuPosition} menuItems={overflowMenu} anchorAlignment={anchorAlignment} shouldOverlay/>
        </react_native_1.View>);
}
CardSectionActions.displayName = 'CardSectionActions';
exports.default = CardSectionActions;
