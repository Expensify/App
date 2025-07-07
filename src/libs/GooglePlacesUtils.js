"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddressComponents = getAddressComponents;
exports.getPlaceAutocompleteTerms = getPlaceAutocompleteTerms;
/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * [{
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }]
 */
function getAddressComponents(addressComponents, fieldsToExtract) {
    var result = {};
    Object.keys(fieldsToExtract).forEach(function (key) { return (result[key] = ''); });
    addressComponents.forEach(function (addressComponent) {
        addressComponent.types.forEach(function (addressType) {
            if (!(addressType in fieldsToExtract) || !(addressType in result && result[addressType] === '')) {
                return;
            }
            var value = addressComponent[fieldsToExtract[addressType]] ? addressComponent[fieldsToExtract[addressType]] : '';
            result[addressType] = value;
        });
    });
    return result;
}
/**
 * Finds an address term by type, and returns the value associated to key. Note that each term in the address must
 * conform to the following ORDER: <street, city, state, country>
 */
function getPlaceAutocompleteTerms(addressTerms) {
    var fieldsToExtract = ['country', 'state', 'city', 'street'];
    var result = {};
    fieldsToExtract.forEach(function (fieldToExtract, index) {
        var _a;
        var fieldTermIndex = addressTerms.length - (index + 1);
        result[fieldToExtract] = fieldTermIndex >= 0 ? (_a = addressTerms.at(fieldTermIndex)) === null || _a === void 0 ? void 0 : _a.value : '';
    });
    return result;
}
