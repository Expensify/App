import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {LogBox} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';
import Log from '../libs/Log';
import {getAddressComponent} from '../libs/GooglePlacesUtils';

// The error that's being thrown below will be ignored until we fork the
// react-native-google-places-autocomplete repo and replace the
// VirtualizedList component with a VirtualizedList-backed instead
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const propTypes = {
    /** The label to display for the field */
    label: PropTypes.string.isRequired,

    /** The value to set the field to initially */
    value: PropTypes.string,

    /** A callback function when the value of this field has changed */
    onChangeText: PropTypes.func.isRequired,

    /** Customize the ExpensiTextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};
const defaultProps = {
    value: '',
    containerStyles: null,
};

const AddressSearch = (props) => {
    const [skippedFirstOnChangeText, setSkippedFirstOnChangeText] = useState(false);

    const saveLocationDetails = (details) => {
        const addressComponents = details.address_components;
        if (addressComponents) {
            // Gather the values from the Google details
            const streetNumber = getAddressComponent(addressComponents, 'street_number', 'long_name') || '';
            const streetName = getAddressComponent(addressComponents, 'route', 'long_name') || '';

            const streetNumberAndName = `${streetNumber} ${streetName}`.trim();

            let city = getAddressComponent(addressComponents, 'locality', 'long_name');
            if (!city) {
                city = getAddressComponent(addressComponents, 'sublocality', 'long_name');
                Log.hmmm('[AddressSearch] Replacing missing locality with sublocality: ', {address: details.formatted_address, sublocality: city});
            }
            const zipCode = getAddressComponent(addressComponents, 'postal_code', 'long_name');
            const state = getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name');

            // Trigger text change events for each of the individual fields being saved on the server
            if (streetNumberAndName.length > props.value.length) {
                // We only replace what the user typed in the address input if we think ours is more complete
                props.onChangeText('addressStreet', streetNumberAndName);
            }
            if (city) {
                props.onChangeText('addressCity', city);
            }
            if (state) {
                props.onChangeText('addressState', state);
            }
            if (zipCode) {
                props.onChangeText('addressZipCode', zipCode);
            }
        }
    };

    return (
        <GooglePlacesAutocomplete
            fetchDetails
            suppressDefaultStyles
            enablePoweredByContainer={false}
            onPress={(data, details) => saveLocationDetails(details)}
            query={{
                key: 'AIzaSyC4axhhXtpiS-WozJEsmlL3Kg3kXucbZus',
                language: props.preferredLocale,
                types: 'address',
                components: 'country:us',
            }}
            requestUrl={{
                useOnPlatform: 'web',
                url: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}api?command=Proxy_GooglePlaces&proxyUrl=`,
            }}
            textInputProps={{
                InputComp: ExpensiTextInput,
                label: props.label,
                containerStyles: props.containerStyles,
                errorText: props.errorText,
                value: props.value,
                onChangeText: (text) => {
                    // This line of code https://github.com/FaridSafi/react-native-google-places-autocomplete/blob/47d7223dd48f85da97e80a0729a985bbbcee353f/GooglePlacesAutocomplete.js#L148
                    // will call onChangeText passing '' after the component renders the first time, clearing its value. Why? who knows, but we have to skip it.
                    if (skippedFirstOnChangeText) {
                        console.log('textInputProps.onChange', text); // TODO: remove
                        props.onChangeText('addressStreet', text);
                    } else {
                        console.log('skipping textInputProps.onChange', text); // TODO: remove
                        setSkippedFirstOnChangeText(true);
                    }
                },
            }}
            styles={{
                textInputContainer: [styles.flexColumn],
                listView: [
                    styles.borderTopRounded,
                    styles.borderBottomRounded,
                    styles.mt1,
                    styles.overflowAuto,
                    styles.borderLeft,
                    styles.borderRight,
                ],
                row: [
                    styles.pv4,
                    styles.ph3,
                    styles.overflowAuto,
                ],
                description: [styles.googleSearchText],
                separator: [styles.googleSearchSeparator],
            }}
        />
    );
};

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
