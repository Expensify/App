import _ from 'underscore';
import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {LogBox} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';
import Log from '../libs/Log';
import * as GooglePlacesUtils from '../libs/GooglePlacesUtils';

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
    onChange: PropTypes.func.isRequired,

    /** Customize the ExpensiTextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    value: '',
    containerStyles: [],
};

// Do not convert to class component! It's been tried before and presents more challenges than it's worth.
// Relevant thread: https://expensify.slack.com/archives/C03TQ48KC/p1634088400387400
// Reference: https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/609#issuecomment-886133839
const AddressSearch = (props) => {
    const [displayListViewBorder, setDisplayListViewBorder] = useState(false);

    // We use `skippedFirstOnChangeTextRef` to work around a feature of the library:
    // The library is calling onChangeText with '' at the start and we don't need this
    // https://github.com/FaridSafi/react-native-google-places-autocomplete/blob/47d7223dd48f85da97e80a0729a985bbbcee353f/GooglePlacesAutocomplete.js#L148
    const skippedFirstOnChangeTextRef = useRef(false);

    const saveLocationDetails = (details) => {
        const addressComponents = details.address_components;
        if (!addressComponents) {
            return;
        }

        // Gather the values from the Google details
        const streetNumber = GooglePlacesUtils.getAddressComponent(addressComponents, 'street_number', 'long_name') || '';
        const streetName = GooglePlacesUtils.getAddressComponent(addressComponents, 'route', 'long_name') || '';
        const street = `${streetNumber} ${streetName}`.trim();
        let city = GooglePlacesUtils.getAddressComponent(addressComponents, 'locality', 'long_name');
        if (!city) {
            city = GooglePlacesUtils.getAddressComponent(addressComponents, 'sublocality', 'long_name');
            Log.hmmm('[AddressSearch] Replacing missing locality with sublocality: ', {address: details.formatted_address, sublocality: city});
        }
        const zipCode = GooglePlacesUtils.getAddressComponent(addressComponents, 'postal_code', 'long_name');
        const state = GooglePlacesUtils.getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name');

        const values = {};
        if (street && street.length > props.value.trim().length) {
            // We are only passing the street number and name if the combined length is longer than the value
            // that was initially passed to the autocomplete component. Google Places can truncate details
            // like Apt # and this is the best way we have to tell that the new value it's giving us is less
            // specific than the one the user entered manually.
            values.street = street;
        }
        if (city) {
            values.city = city;
        }
        if (zipCode) {
            values.zipCode = zipCode;
        }
        if (state) {
            values.state = state;
        }
        if (_.size(values) === 0) {
            return;
        }
        props.onChange(values);
    };

    return (
        <GooglePlacesAutocomplete
            fetchDetails
            suppressDefaultStyles
            enablePoweredByContainer={false}
            onPress={(data, details) => {
                saveLocationDetails(details);

                // After we select an option, we set displayListViewBorder to false to prevent UI flickering
                setDisplayListViewBorder(false);
            }}
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
                    if (skippedFirstOnChangeTextRef.current) {
                        props.onChange({street: text});
                    } else {
                        skippedFirstOnChangeTextRef.current = true;
                    }

                    // If the text is empty, we set displayListViewBorder to false to prevent UI flickering
                    if (_.isEmpty(text)) {
                        setDisplayListViewBorder(false);
                    }
                },
            }}
            styles={{
                textInputContainer: [styles.flexColumn],
                listView: [
                    !displayListViewBorder && styles.googleListView,
                    displayListViewBorder && styles.borderTopRounded,
                    displayListViewBorder && styles.borderBottomRounded,
                    displayListViewBorder && styles.mt1,
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
            onLayout={(event) => {
                // We use the height of the element to determine if we should hide the border of the listView dropdown
                // to prevent a lingering border when there are no address suggestions.
                // The height of the empty element is 2px (1px height for each top and bottom borders)
                setDisplayListViewBorder(event.nativeEvent.layout.height > 2);
            }}
        />
    );
};

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
