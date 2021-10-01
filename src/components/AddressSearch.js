import _ from 'underscore';
import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import ExpensiTextInput from './ExpensiTextInput';

const propTypes = {
    ...withLocalizePropTypes,
};
const defaultProps = {};

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
                .get('long_name')
                .value();
            const zipCode = _.chain(details.address_components)
                .find(component => _.contains(component.types, 'postal_code'))
                .get('long_name')
                .value();
        }
    }

    render() {
        return (
            <GooglePlacesAutocomplete
                fetchDetails
                autoFocus={false}
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
                    label: this.props.translate('common.companyAddress'),
                    containerStyles: [styles.mt4],
                    onChange: console.log,
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
