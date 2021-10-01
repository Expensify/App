import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';
import {TextInput} from 'react-native';

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

class AddressSearch extends React.Component {
    constructor(props) {
        super(props);

        this.saveLocationDetails = this.saveLocationDetails.bind(this);
    }

    /**
     * @param {Object} details See https://developers.google.com/maps/documentation/places/web-service/details#PlaceDetailsResponses
     */
    saveLocationDetails(details) {
        if (details.address_components) {
            // Gather the values from the Google details
            const streetNumber = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'street_number'))
                .get('long_name')
                .value();
            const streetName = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'route'))
                .get('long_name')
                .value();
            const city = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'locality'))
                .get('long_name')
                .value();
            const state = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'administrative_area_level_1'))
                .get('short_name')
                .value();
            const zipCode = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'postal_code'))
                .get('long_name')
                .value();

            // Trigger text change events for each of the individual fields being saved on the server
            this.props.onChangeText('addressStreet', `${streetNumber} ${streetName}`);
            this.props.onChangeText('addressCity', city);
            this.props.onChangeText('addressState', state);
            this.props.onChangeText('addressZipCode', zipCode);
        }
    }

    render() {
        return (
            <GooglePlacesAutocomplete
                fetchDetails
                keepResultsAfterBlur
                onPress={(data, details) => this.saveLocationDetails(details)}
                query={{
                    key: 'AIzaSyC4axhhXtpiS-WozJEsmlL3Kg3kXucbZus',
                    language: this.props.preferredLocale,
                }}
                requestUrl={{
                    useOnPlatform: 'web',
                    url: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}api?command=Proxy_GooglePlaces&proxyUrl=`,
                }}
                textInputProps={{
                    InputComp: ExpensiTextInput,
                    label: this.props.label,
                    // value: this.props.value,
                    containerStyles: this.props.containerStyles,
                    onChangeText: value => console.log(value),
                }}
                styles={{
                    textInputContainer: [styles.googleSearchTextInputContainer],
                }}
            />
        );
    }
}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
