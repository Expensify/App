import _ from 'underscore';
import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {LogBox} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';

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
        googlePlacesRef.current?.setAddressText(props.value);
    }, []);

    const getAddressComponent = (object, field, nameType) => {
        return _.chain(object.address_components)
            .find(component => _.contains(component.types, field))
            .get(nameType)
            .value();
    }


    const saveLocationDetails = (details) => {
        if (details.address_components) {
            // Gather the values from the Google details
            const streetNumber = getAddressComponent(details, 'street_number', 'long_name');
            const streetName = getAddressComponent(details, 'route', 'long_name');
            const city = getAddressComponent(details, 'locality', 'long_name');
            const state = getAddressComponent(details, 'administrative_area_level_1', 'short_name');
            const zipCode = getAddressComponent(details, 'postal_code', 'long_name');

            // Trigger text change events for each of the individual fields being saved on the server
            props.onChangeText('addressStreet', `${streetNumber} ${streetName}`);
            props.onChangeText('addressCity', city);
            props.onChangeText('addressState', state);
            props.onChangeText('addressZipCode', zipCode);
        }
    }

    return (
        <>
            <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                fetchDetails
                keepResultsAfterBlur
                suppressDefaultStyles
                enablePoweredByContainer={false}
                onPress={(data, details) => saveLocationDetails(details)}
                query={{
                    key: 'AIzaSyC4axhhXtpiS-WozJEsmlL3Kg3kXucbZus',
                    language: props.preferredLocale,
                }}
                requestUrl={{
                    useOnPlatform: 'web',
                    url: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}api?command=Proxy_GooglePlaces&proxyUrl=`,
                }}
                textInputProps={{
                    InputComp: ExpensiTextInput,
                    label: props.label,
                    containerStyles: props.containerStyles,
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
        </>
    );

}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
