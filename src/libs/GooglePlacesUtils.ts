type AddressComponent = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    long_name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    short_name: string;
    types: string[];
};
type FieldsToExtract = Record<string, Exclude<keyof AddressComponent, 'types'>>;

/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * [{
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }]
 */
function getAddressComponents(addressComponents: AddressComponent[], fieldsToExtract: FieldsToExtract): Record<string, string> {
    const result: Record<string, string> = {};
    Object.keys(fieldsToExtract).forEach((key) => (result[key] = ''));

    addressComponents.forEach((addressComponent) => {
        addressComponent.types.forEach((addressType) => {
            if (!(addressType in fieldsToExtract) || !(addressType in result && result[addressType] === '')) {
                return;
            }
            const value = addressComponent[fieldsToExtract[addressType]] ? addressComponent[fieldsToExtract[addressType]] : '';
            result[addressType] = value;
        });
    });
    return result;
}

type AddressTerm = {value: string};
type GetPlaceAutocompleteTermsResultKey = 'country' | 'state' | 'city' | 'street';
type GetPlaceAutocompleteTermsResult = Partial<Record<GetPlaceAutocompleteTermsResultKey, string>>;

/**
 * Finds an address term by type, and returns the value associated to key. Note that each term in the address must
 * conform to the following ORDER: <street, city, state, country>
 */
function getPlaceAutocompleteTerms(addressTerms: AddressTerm[]): GetPlaceAutocompleteTermsResult {
    const fieldsToExtract: GetPlaceAutocompleteTermsResultKey[] = ['country', 'state', 'city', 'street'];
    const result: GetPlaceAutocompleteTermsResult = {};
    fieldsToExtract.forEach((fieldToExtract, index) => {
        const fieldTermIndex = addressTerms.length - (index + 1);
        result[fieldToExtract] = fieldTermIndex >= 0 ? addressTerms.at(fieldTermIndex)?.value : '';
    });
    return result;
}

export {getAddressComponents, getPlaceAutocompleteTerms};
export type {AddressComponent, FieldsToExtract, AddressTerm};
