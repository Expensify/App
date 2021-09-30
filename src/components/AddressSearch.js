import React from 'react';
import {Text} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';

const propTypes = {};
const defaultProps = {};

class AddressSearch extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <GooglePlacesAutocomplete
                placeholder='Search'
                onPress={(data, details = null) => {
                    // 'details' is provided when fetchDetails = true
                    console.log(data, details);
                }}
                query={{
                    key: 'AIzaSyC4axhhXtpiS-WozJEsmlL3Kg3kXucbZus',
                    language: 'en',
                }}
                requestUrl={{
                    useOnPlatform: 'web',
                    url: `${CONFIG.EXPENSIFY.URL_EXPENSIFY_COM}api?command=Proxy_GooglePlaces&proxyUrl=`,
                }}
            />
        );
    }
};

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default AddressSearch;
