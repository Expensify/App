"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useOnyx_1 = require("@hooks/useOnyx");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function OnboardingCurrencyPicker(_a) {
    var label = _a.label, value = _a.value, errorText = _a.errorText, style = _a.style, onInputChange = _a.onInputChange, onBlur = _a.onBlur;
    var didOpenCurrencySelector = (0, react_1.useRef)(false);
    var isFocused = (0, native_1.useIsFocused)();
    var draftValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, { canBeMissing: true })[0];
    // eslint-disable-next-line rulesdir/prefer-early-return
    (0, react_1.useEffect)(function () {
        if (draftValues === null || draftValues === void 0 ? void 0 : draftValues.currency) {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(draftValues.currency);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [draftValues === null || draftValues === void 0 ? void 0 : draftValues.currency]);
    (0, react_1.useEffect)(function () {
        if (!isFocused || !didOpenCurrencySelector.current) {
            return;
        }
        didOpenCurrencySelector.current = false;
        onBlur === null || onBlur === void 0 ? void 0 : onBlur();
    }, [isFocused, onBlur]);
    return (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={value ? "".concat(value, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(value)) : undefined} description={label} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} style={style} onPress={function () {
            didOpenCurrencySelector.current = true;
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACE_CURRENCY.getRoute(Navigation_1.default.getActiveRoute()));
        }}/>);
}
OnboardingCurrencyPicker.displayName = 'OnboardingCurrencyPicker';
exports.default = OnboardingCurrencyPicker;
