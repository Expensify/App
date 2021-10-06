import _ from 'underscore';
import React from 'react';
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

class AddressSearch extends React.Component {
    constructor(props) {
        super(props);
        this.googlePlacesRef = React.createRef();
    }

    componentDidMount() {
        this.googlePlacesRef.current?.setAddressText(this.props.value);
    }

    getAddressComponent(object, field, nameType) {
        return _.chain(object.address_components)
            .find(component => _.contains(component.types, field))
            .get(nameType)
            .value();
    }

    /**
     * @param {Object} details See https://developers.google.com/maps/documentation/places/web-service/details#PlaceDetailsResponses
     */
    saveLocationDetails = (details) => {
        if (details.address_components) {
            // Gather the values from the Google details
            const streetNumber = this.getAddressComponent(details, 'street_number', 'long_name');
            const streetName = this.getAddressComponent(details, 'route', 'long_name');
            const city = this.getAddressComponent(details, 'locality', 'long_name');
            const state = this.getAddressComponent(details, 'administrative_area_level_1', 'short_name');
            const zipCode = this.getAddressComponent(details, 'postal_code', 'long_name');

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
                ref={this.googlePlacesRef}
                fetchDetails
                keepResultsAfterBlur
                suppressDefaultStyles
                enablePoweredByContainer={false}
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
                    containerStyles: this.props.containerStyles,
                }}
                styles={{
                    textInputContainer: [styles.flexColumn],
                    listView: [styles.borderTopRounded, styles.borderBottomRounded, styles.mt4, styles.overflowAuto,],
                    row: [
                        styles.pv4,
                        styles.ph3,
                        styles.borderLeft,
                        styles.borderRight,
                        styles.overflowAuto,
                        styles.googleSearchRowWidth,
                    ],
                    separator: [styles.googleSearchSeperator]
                }}
            />
        );
    }
}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
