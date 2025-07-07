"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
function CurrencySelector(_a, ref) {
    var _b = _a.errorText, errorText = _b === void 0 ? '' : _b, currency = _a.value, _c = _a.onInputChange, onInputChange = _c === void 0 ? function () { } : _c, onBlur = _a.onBlur, _d = _a.currencySelectorRoute, currencySelectorRoute = _d === void 0 ? ROUTES_1.default.SETTINGS_CHANGE_CURRENCY : _d;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currencyTitleDescStyle = currency ? styles.textNormal : null;
    var didOpenCurrencySelector = (0, react_1.useRef)(false);
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        if (!isFocused || !didOpenCurrencySelector.current) {
            return;
        }
        didOpenCurrencySelector.current = false;
        onBlur === null || onBlur === void 0 ? void 0 : onBlur();
    }, [isFocused, onBlur]);
    (0, react_1.useEffect)(function () {
        // This will cause the form to revalidate and remove any error related to currency
        onInputChange(currency);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [currency]);
    return (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={currency} ref={ref} descriptionTextStyle={currencyTitleDescStyle} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} description={translate('common.currency')} errorText={errorText} onPress={function () {
            didOpenCurrencySelector.current = true;
            Navigation_1.default.navigate(currencySelectorRoute);
        }}/>);
}
CurrencySelector.displayName = 'CurrencySelector';
exports.default = (0, react_1.forwardRef)(CurrencySelector);
