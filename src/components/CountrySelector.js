"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var useGeographicalStateAndCountryFromRoute_1 = require("@hooks/useGeographicalStateAndCountryFromRoute");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var MenuItemWithTopDescription_1 = require("./MenuItemWithTopDescription");
function CountrySelector(_a, ref) {
    var _b = _a.errorText, errorText = _b === void 0 ? '' : _b, countryCode = _a.value, _c = _a.onInputChange, onInputChange = _c === void 0 ? function () { } : _c, onBlur = _a.onBlur;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var countryFromUrl = (0, useGeographicalStateAndCountryFromRoute_1.default)().country;
    var title = countryCode ? translate("allCountries.".concat(countryCode)) : '';
    var countryTitleDescStyle = title.length === 0 ? styles.textNormal : null;
    var didOpenCountrySelector = (0, react_1.useRef)(false);
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        // Check if the country selector was opened and no value was selected, triggering onBlur to display an error
        if (isFocused && didOpenCountrySelector.current) {
            didOpenCountrySelector.current = false;
            if (!countryFromUrl) {
                onBlur === null || onBlur === void 0 ? void 0 : onBlur();
            }
        }
        // If no country is selected from the URL, exit the effect early to avoid further processing.
        if (!countryFromUrl) {
            return;
        }
        // If a country is selected, invoke `onInputChange` to update the form and clear any validation errors related to the country selection.
        if (onInputChange) {
            onInputChange(countryFromUrl);
        }
        // Clears the `country` parameter from the URL to ensure the component country is driven by the parent component rather than URL parameters.
        // This helps prevent issues where the component might not update correctly if the country is controlled by both the parent and the URL.
        Navigation_1.default.setParams({ country: undefined });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [countryFromUrl, isFocused, onBlur]);
    return (<MenuItemWithTopDescription_1.default shouldShowRightIcon title={title} ref={ref} descriptionTextStyle={countryTitleDescStyle} brickRoadIndicator={errorText ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined} description={translate('common.country')} errorText={errorText} onPress={function () {
            var activeRoute = Navigation_1.default.getActiveRoute();
            didOpenCountrySelector.current = true;
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADDRESS_COUNTRY.getRoute(countryCode !== null && countryCode !== void 0 ? countryCode : '', activeRoute));
        }}/>);
}
CountrySelector.displayName = 'CountrySelector';
exports.default = (0, react_1.forwardRef)(CountrySelector);
