"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ConstantSelector(_a, 
// The ref is required by React.forwardRef to avoid warnings, even though it's not used yet.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
ref) {
    var _b;
    var formType = _a.formType, policyID = _a.policyID, _c = _a.errorText, errorText = _c === void 0 ? '' : _c, name = _a.name, value = _a.value, onInputChange = _a.onInputChange;
    var fieldValue = (_b = (0, native_1.useRoute)().params) === null || _b === void 0 ? void 0 : _b[name];
    (0, react_1.useEffect)(function () {
        var _a;
        // If no constant is selected from the URL, exit the effect early to avoid further processing.
        if (!fieldValue && fieldValue !== '') {
            return;
        }
        // If a constant is selected, invoke `onInputChange` to update the form and clear any validation errors related to the constant selection.
        if (onInputChange) {
            onInputChange(fieldValue);
        }
        // Clears the `constant` parameter from the URL to ensure the component constant is driven by the parent component rather than URL parameters.
        // This helps prevent issues where the component might not update correctly if the country is controlled by both the parent and the URL.
        Navigation_1.default.setParams((_a = {}, _a[name] = undefined, _a));
    }, [fieldValue, name, onInputChange]);
    return (<MenuItemWithTopDescription_1.default title={value} description={name} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} errorText={errorText} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.DETAILS_CONSTANT_PICKER_PAGE.getRoute(formType, name, value, policyID, Navigation_1.default.getActiveRoute()));
        }} shouldShowRightIcon/>);
}
ConstantSelector.displayName = 'ConstantSelector';
exports.default = (0, react_1.forwardRef)(ConstantSelector);
