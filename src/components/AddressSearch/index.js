"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_google_places_autocomplete_1 = require("react-native-google-places-autocomplete");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var LocationErrorMessage_1 = require("@components/LocationErrorMessage");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var UserLocation_1 = require("@libs/actions/UserLocation");
var ApiUtils_1 = require("@libs/ApiUtils");
var getCurrentPosition_1 = require("@libs/getCurrentPosition");
var GooglePlacesUtils_1 = require("@libs/GooglePlacesUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var CurrentLocationButton_1 = require("./CurrentLocationButton");
var isCurrentTargetInsideContainer_1 = require("./isCurrentTargetInsideContainer");
/**
 * Check if the place matches the search by the place name or description.
 * @param search The search string for a place
 * @param place The place to check for a match on the search
 * @returns true if search is related to place, otherwise it returns false.
 */
function isPlaceMatchForSearch(search, place) {
    var _a;
    if (!search) {
        return true;
    }
    if (!place) {
        return false;
    }
    var fullSearchSentence = "".concat((_a = place.name) !== null && _a !== void 0 ? _a : '', " ").concat(place.description);
    return search.split(' ').every(function (searchTerm) { return !searchTerm || fullSearchSentence.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()); });
}
// The error that's being thrown below will be ignored until we fork the
// react-native-google-places-autocomplete repo and replace the
// VirtualizedList component with a VirtualizedList-backed instead
react_native_1.LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
function AddressSearch(_a, ref) {
    var _b = _a.canUseCurrentLocation, canUseCurrentLocation = _b === void 0 ? false : _b, containerStyles = _a.containerStyles, defaultValue = _a.defaultValue, _c = _a.errorText, errorText = _c === void 0 ? '' : _c, _d = _a.hint, hint = _d === void 0 ? '' : _d, inputID = _a.inputID, limitSearchesToCountry = _a.limitSearchesToCountry, label = _a.label, maxInputLength = _a.maxInputLength, onFocus = _a.onFocus, onBlur = _a.onBlur, onInputChange = _a.onInputChange, onPress = _a.onPress, onCountryChange = _a.onCountryChange, _e = _a.predefinedPlaces, predefinedPlaces = _e === void 0 ? [] : _e, _f = _a.renamedInputKeys, renamedInputKeys = _f === void 0 ? {
        street: 'addressStreet',
        street2: 'addressStreet2',
        city: 'addressCity',
        state: 'addressState',
        zipCode: 'addressZipCode',
        lat: 'addressLat',
        lng: 'addressLng',
    } : _f, _g = _a.resultTypes, resultTypes = _g === void 0 ? 'address' : _g, _h = _a.shouldSaveDraft, shouldSaveDraft = _h === void 0 ? false : _h, value = _a.value, locationBias = _a.locationBias, caretHidden = _a.caretHidden;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _j = (0, useLocalize_1.default)(), translate = _j.translate, preferredLocale = _j.preferredLocale;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _k = (0, react_1.useState)(false), displayListViewBorder = _k[0], setDisplayListViewBorder = _k[1];
    var _l = (0, react_1.useState)(false), isTyping = _l[0], setIsTyping = _l[1];
    var _m = (0, react_1.useState)(false), isFocused = _m[0], setIsFocused = _m[1];
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var _o = (0, react_1.useState)(''), searchValue = _o[0], setSearchValue = _o[1];
    var _p = (0, react_1.useState)(null), locationErrorCode = _p[0], setLocationErrorCode = _p[1];
    var _q = (0, react_1.useState)(false), isFetchingCurrentLocation = _q[0], setIsFetchingCurrentLocation = _q[1];
    var shouldTriggerGeolocationCallbacks = (0, react_1.useRef)(true);
    var _r = (0, react_1.useState)(false), shouldHidePredefinedPlaces = _r[0], setShouldHidePredefinedPlaces = _r[1];
    var containerRef = (0, react_1.useRef)(null);
    var query = (0, react_1.useMemo)(function () { return (__assign({ language: preferredLocale, types: resultTypes, components: limitSearchesToCountry ? "country:".concat(limitSearchesToCountry.toLocaleLowerCase()) : undefined }, (locationBias && { locationbias: locationBias }))); }, [preferredLocale, resultTypes, limitSearchesToCountry, locationBias]);
    var shouldShowCurrentLocationButton = canUseCurrentLocation && searchValue.trim().length === 0 && isFocused;
    var saveLocationDetails = function (autocompleteData, details) {
        var _a, _b, _c, _d, _e, _f, _g;
        var addressComponents = details === null || details === void 0 ? void 0 : details.address_components;
        if (!addressComponents) {
            // When there are details, but no address_components, this indicates that some predefined options have been passed
            // to this component which don't match the usual properties coming from auto-complete. In that case, only a limited
            // amount of data massaging needs to happen for what the parent expects to get from this function.
            if (details) {
                onPress === null || onPress === void 0 ? void 0 : onPress({
                    address: (_a = autocompleteData.description) !== null && _a !== void 0 ? _a : '',
                    lat: (_b = details.geometry.location.lat) !== null && _b !== void 0 ? _b : 0,
                    lng: (_c = details.geometry.location.lng) !== null && _c !== void 0 ? _c : 0,
                    name: details.name,
                });
            }
            return;
        }
        // Gather the values from the Google details
        var _h = (0, GooglePlacesUtils_1.getAddressComponents)(addressComponents, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            street_number: 'long_name',
            route: 'long_name',
            subpremise: 'long_name',
            locality: 'long_name',
            sublocality: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            postal_town: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            postal_code: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_1: 'short_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_2: 'long_name',
            country: 'short_name',
        }), streetNumber = _h.street_number, streetName = _h.route, subpremise = _h.subpremise, locality = _h.locality, sublocality = _h.sublocality, postalTown = _h.postal_town, zipCode = _h.postal_code, state = _h.administrative_area_level_1, stateFallback = _h.administrative_area_level_2, countryPrimary = _h.country;
        // The state's iso code (short_name) is needed for the StatePicker component but we also
        // need the state's full name (long_name) when we render the state in a TextInput.
        var longStateName = (0, GooglePlacesUtils_1.getAddressComponents)(addressComponents, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_1: 'long_name',
        }).administrative_area_level_1;
        // Make sure that the order of keys remains such that the country is always set above the state.
        // Refer to https://github.com/Expensify/App/issues/15633 for more information.
        var _j = (0, GooglePlacesUtils_1.getPlaceAutocompleteTerms)((_d = autocompleteData === null || autocompleteData === void 0 ? void 0 : autocompleteData.terms) !== null && _d !== void 0 ? _d : []), _k = _j.country, countryFallbackLongName = _k === void 0 ? '' : _k, _l = _j.state, stateAutoCompleteFallback = _l === void 0 ? '' : _l, _m = _j.city, cityAutocompleteFallback = _m === void 0 ? '' : _m;
        var countryFallback = Object.keys(CONST_1.default.ALL_COUNTRIES).find(function (country) { return country === countryFallbackLongName; });
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var country = countryPrimary || countryFallback || '';
        var values = {
            street: "".concat(streetNumber, " ").concat(streetName).trim(),
            name: (_e = details.name) !== null && _e !== void 0 ? _e : '',
            // Autocomplete returns any additional valid address fragments (e.g. Apt #) as subpremise.
            street2: subpremise,
            // Make sure country is updated first, since city and state will be reset if the country changes
            country: '',
            state: state || stateAutoCompleteFallback,
            // When locality is not returned, many countries return the city as postalTown (e.g. 5 New Street
            // Square, London), otherwise as sublocality (e.g. 384 Court Street Brooklyn). If postalTown is
            // returned, the sublocality will be a city subdivision so shouldn't take precedence (e.g.
            // Salagatan, Uppsala, Sweden).
            city: locality || postalTown || sublocality || cityAutocompleteFallback,
            zipCode: zipCode,
            lat: (_f = details.geometry.location.lat) !== null && _f !== void 0 ? _f : 0,
            lng: (_g = details.geometry.location.lng) !== null && _g !== void 0 ? _g : 0,
            address: autocompleteData.description || details.formatted_address || '',
        };
        // If the address is not in the US, use the full length state name since we're displaying the address's
        // state / province in a TextInput instead of in a picker.
        if (country !== CONST_1.default.COUNTRY.US && country !== CONST_1.default.COUNTRY.CA) {
            values.state = longStateName;
        }
        // UK addresses return countries (e.g. England) in the state field (administrative_area_level_1)
        // So we use a secondary field (administrative_area_level_2) as a fallback
        if (country === CONST_1.default.COUNTRY.GB) {
            values.state = stateFallback;
        }
        // Set the state to be the same as the city in case the state is empty.
        if (!values.state) {
            values.state = values.city;
        }
        // Some edge-case addresses may lack both street_number and route in the API response, resulting in an empty "values.street"
        // We are setting up a fallback to ensure "values.street" is populated with a relevant value
        if (!values.street && details.adr_address) {
            var streetAddressRegex = /<span class="street-address">([^<]*)<\/span>/;
            var adrAddress = details.adr_address.match(streetAddressRegex);
            var streetAddressFallback = adrAddress ? adrAddress === null || adrAddress === void 0 ? void 0 : adrAddress[1] : null;
            if (streetAddressFallback) {
                values.street = streetAddressFallback;
            }
        }
        // Not all pages define the Address Line 2 field, so in that case we append any additional address details
        // (e.g. Apt #) to Address Line 1
        if (subpremise && typeof (renamedInputKeys === null || renamedInputKeys === void 0 ? void 0 : renamedInputKeys.street2) === 'undefined') {
            values.street += ", ".concat(subpremise);
        }
        var isValidCountryCode = !!Object.keys(CONST_1.default.ALL_COUNTRIES).find(function (foundCountry) { return foundCountry === country; });
        if (isValidCountryCode) {
            values.country = country;
        }
        if (inputID) {
            Object.entries(values).forEach(function (_a) {
                var _b;
                var key = _a[0], inputValue = _a[1];
                var inputKey = (_b = renamedInputKeys === null || renamedInputKeys === void 0 ? void 0 : renamedInputKeys[key]) !== null && _b !== void 0 ? _b : key;
                if (!inputKey) {
                    return;
                }
                onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(inputValue, inputKey);
            });
        }
        else {
            onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(values);
        }
        onCountryChange === null || onCountryChange === void 0 ? void 0 : onCountryChange(values.country);
        onPress === null || onPress === void 0 ? void 0 : onPress(values);
    };
    /** Gets the user's current location and registers success/error callbacks */
    var getCurrentLocation = function () {
        if (isFetchingCurrentLocation) {
            return;
        }
        setIsTyping(false);
        setIsFocused(false);
        setDisplayListViewBorder(false);
        setIsFetchingCurrentLocation(true);
        react_native_1.Keyboard.dismiss();
        (0, getCurrentPosition_1.default)(function (successData) {
            if (!shouldTriggerGeolocationCallbacks.current) {
                return;
            }
            setIsFetchingCurrentLocation(false);
            setLocationErrorCode(null);
            var _a = successData.coords, latitude = _a.latitude, longitude = _a.longitude;
            var location = {
                lat: latitude,
                lng: longitude,
                address: CONST_1.default.YOUR_LOCATION_TEXT,
                name: CONST_1.default.YOUR_LOCATION_TEXT,
            };
            // Update the current user location
            (0, UserLocation_1.setUserLocation)({ longitude: longitude, latitude: latitude });
            onPress === null || onPress === void 0 ? void 0 : onPress(location);
        }, function (errorData) {
            var _a;
            if (!shouldTriggerGeolocationCallbacks.current) {
                return;
            }
            setIsFetchingCurrentLocation(false);
            setLocationErrorCode((_a = errorData === null || errorData === void 0 ? void 0 : errorData.code) !== null && _a !== void 0 ? _a : null);
        }, {
            maximumAge: 0, // No cache, always get fresh location info
            timeout: 30000,
        });
    };
    var renderHeaderComponent = function () {
        var _a;
        return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {((_a = predefinedPlaces === null || predefinedPlaces === void 0 ? void 0 : predefinedPlaces.length) !== null && _a !== void 0 ? _a : 0) > 0 && (<react_native_1.View style={styles.overflowAuto}>
                    {/* This will show current location button in list if there are some recent destinations */}
                    {shouldShowCurrentLocationButton && (<CurrentLocationButton_1.default onPress={getCurrentLocation} isDisabled={isOffline}/>)}
                    {!value && <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.pv2, styles.ph3, styles.overflowAuto]}>{translate('common.recentDestinations')}</Text_1.default>}
                </react_native_1.View>)}
        </>);
    };
    // eslint-disable-next-line arrow-body-style
    (0, react_1.useEffect)(function () {
        return function () {
            // If the component unmounts we don't want any of the callback for geolocation to run.
            shouldTriggerGeolocationCallbacks.current = false;
        };
    }, []);
    var filteredPredefinedPlaces = (0, react_1.useMemo)(function () {
        var _a;
        if (!searchValue) {
            return predefinedPlaces !== null && predefinedPlaces !== void 0 ? predefinedPlaces : [];
        }
        if (shouldHidePredefinedPlaces) {
            return [];
        }
        return (_a = predefinedPlaces === null || predefinedPlaces === void 0 ? void 0 : predefinedPlaces.filter(function (predefinedPlace) { return isPlaceMatchForSearch(searchValue, predefinedPlace); })) !== null && _a !== void 0 ? _a : [];
    }, [predefinedPlaces, searchValue, shouldHidePredefinedPlaces]);
    var listEmptyComponent = (0, react_1.useMemo)(function () { return (!isTyping ? undefined : <Text_1.default style={[styles.textLabel, styles.colorMuted, styles.pv4, styles.ph3, styles.overflowAuto]}>{translate('common.noResultsFound')}</Text_1.default>); }, [isTyping, styles, translate]);
    var listLoader = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.pv4]}>
                <react_native_1.ActivityIndicator color={theme.spinner} size="small"/>
            </react_native_1.View>); }, [styles.pv4, theme.spinner]);
    return (
    /*
     * The GooglePlacesAutocomplete component uses a VirtualizedList internally,
     * and VirtualizedLists cannot be directly nested within other VirtualizedLists of the same orientation.
     * To work around this, we wrap the GooglePlacesAutocomplete component with a horizontal ScrollView
     * that has scrolling disabled and would otherwise not be needed
     */
    <>
            <ScrollView_1.default horizontal contentContainerStyle={styles.flex1} scrollEnabled={false} 
    // keyboardShouldPersistTaps="always" is required for Android native,
    // otherwise tapping on a result doesn't do anything. More information
    // here: https://github.com/FaridSafi/react-native-google-places-autocomplete#use-inside-a-scrollview-or-flatlist
    keyboardShouldPersistTaps="always">
                <react_native_1.View style={styles.w100} ref={containerRef}>
                    <react_native_google_places_autocomplete_1.GooglePlacesAutocomplete disableScroll fetchDetails suppressDefaultStyles enablePoweredByContainer={false} predefinedPlaces={filteredPredefinedPlaces} listEmptyComponent={listEmptyComponent} listLoaderComponent={listLoader} renderHeaderComponent={renderHeaderComponent} renderRow={function (data) {
            var title = data.isPredefinedPlace ? data.name : data.structured_formatting.main_text;
            var subtitle = data.isPredefinedPlace ? data.description : data.structured_formatting.secondary_text;
            return (<react_native_1.View>
                                    {!!title && <Text_1.default style={styles.googleSearchText}>{title}</Text_1.default>}
                                    <Text_1.default style={[title ? styles.textLabelSupporting : styles.googleSearchText]}>{subtitle}</Text_1.default>
                                </react_native_1.View>);
        }} onPress={function (data, details) {
            saveLocationDetails(data, details);
            setIsTyping(false);
            // After we select an option, we set displayListViewBorder to false to prevent UI flickering
            setDisplayListViewBorder(false);
            setIsFocused(false);
            // Clear location error code after address is selected
            setLocationErrorCode(null);
        }} query={query} requestUrl={{
            useOnPlatform: 'all',
            url: isOffline ? '' : (0, ApiUtils_1.getCommandURL)({ command: 'Proxy_GooglePlaces?proxyUrl=' }),
        }} textInputProps={{
            InputComp: TextInput_1.default,
            ref: ref,
            label: label,
            containerStyles: containerStyles,
            errorText: errorText,
            hint: displayListViewBorder || ((predefinedPlaces === null || predefinedPlaces === void 0 ? void 0 : predefinedPlaces.length) === 0 && shouldShowCurrentLocationButton) || (canUseCurrentLocation && isTyping) ? undefined : hint,
            value: value,
            defaultValue: defaultValue,
            inputID: inputID,
            shouldSaveDraft: shouldSaveDraft,
            onFocus: function () {
                setIsFocused(true);
                onFocus === null || onFocus === void 0 ? void 0 : onFocus();
            },
            onBlur: function (event) {
                if (!(0, isCurrentTargetInsideContainer_1.default)(event, containerRef)) {
                    setDisplayListViewBorder(false);
                    setIsFocused(false);
                    setIsTyping(false);
                }
                onBlur === null || onBlur === void 0 ? void 0 : onBlur();
            },
            autoComplete: 'off',
            onInputChange: function (text) {
                setSearchValue(text);
                setIsTyping(true);
                setShouldHidePredefinedPlaces(!isOffline);
                if (inputID) {
                    onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange(text);
                }
                else {
                    onInputChange === null || onInputChange === void 0 ? void 0 : onInputChange({ street: text });
                }
                // If the text is empty and we have no predefined places, we set displayListViewBorder to false to prevent UI flickering
                if (!text && !(predefinedPlaces === null || predefinedPlaces === void 0 ? void 0 : predefinedPlaces.length)) {
                    setDisplayListViewBorder(false);
                }
            },
            maxLength: maxInputLength,
            spellCheck: false,
            selectTextOnFocus: true,
            caretHidden: caretHidden,
        }} styles={{
            textInputContainer: [styles.flexColumn],
            listView: [StyleUtils.getGoogleListViewStyle(displayListViewBorder), styles.borderLeft, styles.borderRight, !isFocused && styles.h0],
            row: [styles.pv4, styles.ph3, styles.overflowAuto],
            description: [styles.googleSearchText],
            separator: [styles.googleSearchSeparator, styles.overflowAuto],
            container: [styles.mh100],
        }} numberOfLines={2} isRowScrollable={false} listHoverColor={theme.border} listUnderlayColor={theme.buttonPressedBG} onLayout={function (event) {
            // We use the height of the element to determine if we should hide the border of the listView dropdown
            // to prevent a lingering border when there are no address suggestions.
            setDisplayListViewBorder(event.nativeEvent.layout.height > variables_1.default.googleEmptyListViewHeight);
        }} inbetweenCompo={
        // We want to show the current location button even if there are no recent destinations
        (predefinedPlaces === null || predefinedPlaces === void 0 ? void 0 : predefinedPlaces.length) === 0 && shouldShowCurrentLocationButton ? (<react_native_1.View style={[StyleUtils.getGoogleListViewStyle(true), styles.overflowAuto, styles.borderLeft, styles.borderRight]}>
                                    <CurrentLocationButton_1.default onPress={getCurrentLocation} isDisabled={isOffline}/>
                                </react_native_1.View>) : undefined} placeholder="" listViewDisplayed>
                        <LocationErrorMessage_1.default onClose={function () { return setLocationErrorCode(null); }} locationErrorCode={locationErrorCode}/>
                    </react_native_google_places_autocomplete_1.GooglePlacesAutocomplete>
                </react_native_1.View>
            </ScrollView_1.default>
            {isFetchingCurrentLocation && <FullscreenLoadingIndicator_1.default />}
        </>);
}
AddressSearch.displayName = 'AddressSearchWithRef';
exports.default = (0, react_1.forwardRef)(AddressSearch);
