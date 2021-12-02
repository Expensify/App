import _ from 'underscore';
import React, {useEffect, useState, useRef} from 'react';
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
    containerStyles: null,
};

// Do not convert to class component! It's been tried before and presents more challenges than it's worth.
// Relevant thread: https://expensify.slack.com/archives/C03TQ48KC/p1634088400387400
// Reference: https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/609#issuecomment-886133839
const AddressSearch = (props) => {
    const googlePlacesRef = useRef();
    const [displayListViewBorder, setDisplayListViewBorder] = useState(false);
    useEffect(() => {
        if (!googlePlacesRef.current) {
            return;
        }

        googlePlacesRef.current.setAddressText(props.value);
    }, []);

    const saveLocationDetails = (details) => {
        const addressComponents = details.address_components;
        if (!addressComponents) {
            return;
        }

        // Gather the values from the Google details
        const streetNumber = GooglePlacesUtils.getAddressComponent(addressComponents, 'street_number', 'long_name') || '';
        const streetName = GooglePlacesUtils.getAddressComponent(addressComponents, 'route', 'long_name') || '';
        const addressStreet = `${streetNumber} ${streetName}`.trim();
        let addressCity = GooglePlacesUtils.getAddressComponent(addressComponents, 'locality', 'long_name');
        if (!addressCity) {
            addressCity = GooglePlacesUtils.getAddressComponent(addressComponents, 'sublocality', 'long_name');
            Log.hmmm('[AddressSearch] Replacing missing locality with sublocality: ', {address: details.formatted_address, sublocality: addressCity});
        }
        const addressZipCode = GooglePlacesUtils.getAddressComponent(addressComponents, 'postal_code', 'long_name');
        const addressState = GooglePlacesUtils.getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name');

        const values = {};
        if (addressStreet) {
            values.addressStreet = addressStreet;
        }
        if (addressCity) {
            values.addressCity = addressCity;
        }
        if (addressZipCode) {
            values.addressZipCode = addressZipCode;
        }
        if (addressState) {
            values.addressState = addressState;
        }
        if (_.size(values) === 0) {
            return;
        }

        props.onChange(values);
    };

    return (
        <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            fetchDetails
            suppressDefaultStyles
            enablePoweredByContainer={false}
            placeholder=""
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
                onChangeText: (text) => {
                    props.onChange({addressStreet: text});

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
