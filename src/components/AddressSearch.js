import React, {PureComponent} from 'react';
import _ from 'underscore';
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
    onChange: PropTypes.func.isRequired,

    /** Customize the ExpensiTextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    value: '',
    containerStyles: null,
};

class AddressSearch extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            skippedFirstOnChangeText: false,
            displayListViewBorder: false,
        };
    }

    saveLocationDetails(details) {
        const addressComponents = details.address_components;
        if (addressComponents) {
            // Gather the values from the Google details
            const streetNumber = getAddressComponent(addressComponents, 'street_number', 'long_name') || '';
            const streetName = getAddressComponent(addressComponents, 'route', 'long_name') || '';

            const addressStreet = `${streetNumber} ${streetName}`.trim();

            let addressCity = getAddressComponent(addressComponents, 'locality', 'long_name');
            if (!addressCity) {
                addressCity = getAddressComponent(addressComponents, 'sublocality', 'long_name');
                Log.hmmm('[AddressSearch] Replacing missing locality with sublocality: ', {address: details.formatted_address, sublocality: addressCity});
            }
            const addressZipCode = getAddressComponent(addressComponents, 'postal_code', 'long_name');
            const addressState = getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name');

            this.props.onChange(_.pick({
                addressCity,
                addressState,
                addressZipCode,
                addressStreet,
            }, _.identity));
        }
    }

    render() {
        return (
            <GooglePlacesAutocomplete
                fetchDetails
                suppressDefaultStyles
                enablePoweredByContainer={false}
                onPress={(data, details) => {
                    this.saveLocationDetails(details);

                    // After we select an option, we set displayListViewBorder to false to prevent UI flickering
                    this.setState({displayListViewBorder: false});
                }}
                query={{
                    key: 'AIzaSyC4axhhXtpiS-WozJEsmlL3Kg3kXucbZus',
                    language: this.props.preferredLocale,
                    types: 'address',
                    components: 'country:us',
                }}
                requestUrl={{
                    useOnPlatform: 'web',
                    url: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}api?command=Proxy_GooglePlaces&proxyUrl=`,
                }}
                textInputProps={{
                    InputComp: ExpensiTextInput,
                    label: this.props.label,
                    containerStyles: this.props.containerStyles,
                    errorText: this.props.errorText,
                    value: this.props.value,
                    onChangeText: (text) => {
                        // Line of code https://github.com/FaridSafi/react-native-google-places-autocomplete/blob/47d7223dd48f85da97e80a0729a985bbbcee353f/GooglePlacesAutocomplete.js#L148
                        // will call onChangeText passing '' after the component renders the first time, clearing its value. Why? who knows, but we have to skip it.
                        if (this.state.skippedFirstOnChangeText) {
                            this.props.onChange({addressStreet: text});
                        } else {
                            this.setState({skippedFirstOnChangeText: true});
                        }

                        // If the text is empty, we set displayListViewBorder to false to prevent UI flickering
                        if (_.isEmpty(text)) {
                            this.setState({displayListViewBorder: false});
                        }
                    },
                }}
                styles={{
                    textInputContainer: [styles.flexColumn],
                    listView: [
                        !this.state.displayListViewBorder && styles.googleListView,
                        this.state.displayListViewBorder && styles.borderTopRounded,
                        this.state.displayListViewBorder && styles.borderBottomRounded,
                        this.state.displayListViewBorder && styles.mt1,
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
                    this.setState({displayListViewBorder: event.nativeEvent.layout.height > 2});
                }}
            />
        );
    }
}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
