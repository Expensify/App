import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import {View, Text} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';


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

    /**
     * @param {Object} details See https://developers.google.com/maps/documentation/places/web-service/details#PlaceDetailsResponses
     */
    saveLocationDetails = (details) => {
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
                    textInputContainer: [styles.googleSearchTextInputContainer],
                }}
                renderRow={(data, index) => {
                    // This is using a custom render component in order for the styles to be properly applied to the top row.
                    // The styles for the top and bottom row could have instead by passed to `styles.listView` for
                    // <GooglePlacesAutocomplete>, however the list is always visible, even when there are no results.
                    // Because of this, if the padding and borders are applied to the list, even when it's empty, it takes
                    // up space in the UI and looks like a horizontal line with padding around it.
                    // Using this custom render, the rounded borders and padding can be applied to the first row
                    // so that they are only visible when there are results.
                    const rowStyles = [styles.pv4, styles.ph3, styles.borderLeft, styles.borderRight, styles.borderBottom];

                    if (index === 0) {
                        rowStyles.push(styles.borderTop);
                        rowStyles.push(styles.mt2);
                    }
                    return (
                        <View style={rowStyles}>
                            <Text>{data.description}</Text>
                        </View>
                    );
                }}
            />
        );
    }
}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(AddressSearch);
