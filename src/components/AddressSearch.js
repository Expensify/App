import _ from 'underscore';
import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {LogBox} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';
import Log from '../libs/Log';
import {getAddressComponent, isAddressValidForVBA} from '../libs/GooglePlacesUtils';

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
    const googlePlacesRef = useRef();
    useEffect(() => {
        if (!googlePlacesRef.current) {
            return;
        }

        googlePlacesRef.current.setAddressText(props.value);
    }, []);

    const saveLocationDetails = (details) => {
        const addressComponents = details.address_components;
        if (isAddressValidForVBA(addressComponents)) {
            // Gather the values from the Google details
            const streetNumber = getAddressComponent(addressComponents, 'street_number', 'long_name');
            const streetName = getAddressComponent(addressComponents, 'route', 'long_name');
            let city = getAddressComponent(addressComponents, 'locality', 'long_name');
            if (!city) {
                city = getAddressComponent(addressComponents, 'sublocality', 'long_name');
                Log.hmmm('[AddressSearch] Replacing missing locality with sublocality: ', {address: details.formatted_address, sublocality: city});
            }
            const state = getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name');
            const zipCode = getAddressComponent(addressComponents, 'postal_code', 'long_name');

            // Trigger text change events for each of the individual fields being saved on the server
            props.onChangeText('addressStreet', `${streetNumber} ${streetName}`);
            props.onChangeText('addressCity', city);
            props.onChangeText('addressState', state);
            props.onChangeText('addressZipCode', zipCode);
        } else {
            // Clear the values associated to the address, so our validations catch the problem
            Log.hmmm('[AddressSearch] Search result failed validation: ', {
                address: details.formatted_address,
                address_components: addressComponents,
                place_id: details.place_id,
            });
            props.onChangeText('addressStreet', null);
            props.onChangeText('addressCity', null);
            props.onChangeText('addressState', null);
            props.onChangeText('addressZipCode', null);
        }
    };

    return (
        <GooglePlacesAutocomplete
            ref={googlePlacesRef}
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
                onChangeText: (text) => {
                    const isTextValid = !_.isEmpty(text) && _.isEqual(text, props.value);

                    // Ensure whether an address is selected already or has address value initialized.
                    if (!_.isEmpty(googlePlacesRef.current.getAddressText()) && !isTextValid) {
                        saveLocationDetails({});
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
