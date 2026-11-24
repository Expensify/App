/**
 * The parts of an address form, for a caller that draws some of them its own way. Every part goes inside `AddressFields.Provider`,
 * which shares the form keys and the picked country between them. Callers that draw every part as is use `AddressFormFields`.
 */
import AddressCityInput from './AddressCityInput';
import AddressCountrySelector from './AddressCountrySelector';
import AddressFieldsProvider, {useAddressFields} from './AddressFieldsProvider';
import AddressStateSelector from './AddressStateSelector';
import AddressStreetInput from './AddressStreetInput';
import AddressZipCodeInput from './AddressZipCodeInput';

const AddressFields = {
    Provider: AddressFieldsProvider,
    Street: AddressStreetInput,
    City: AddressCityInput,
    State: AddressStateSelector,
    ZipCode: AddressZipCodeInput,
    Country: AddressCountrySelector,
};

export default AddressFields;
export {useAddressFields};
