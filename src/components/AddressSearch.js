import _ from 'underscore';
import React, {useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {LogBox, ScrollView, View} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import CONFIG from '../CONFIG';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import TextInput from './TextInput';
import Log from '../libs/Log';
import * as GooglePlacesUtils from '../libs/GooglePlacesUtils';
import * as FormUtils from '../libs/FormUtils';

// The error that's being thrown below will be ignored until we fork the
// react-native-google-places-autocomplete repo and replace the
// VirtualizedList component with a VirtualizedList-backed instead
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const propTypes = {
    /** Indicates that the input is being used with the Form component */
    isFormInput: PropTypes.bool,

    /**
     * The ID used to uniquely identify the input
     *
     * @param {Object} props - props passed to the input
     * @returns {Object} - returns an Error object if isFormInput is supplied but inputID is falsey or not a string
     */
    inputID: props => FormUtils.validateInputIDProps(props),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** Error text to display */
    errorText: PropTypes.string,

    /** The label to display for the field */
    label: PropTypes.string.isRequired,

    /** The value to set the field to initially */
    value: PropTypes.string,

    /** A callback function when the value of this field has changed */
    onChange: PropTypes.func.isRequired,

    /** Customize the TextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    ...withLocalizePropTypes,
};

const defaultProps = {
    isFormInput: false,
    inputID: undefined,
    shouldSaveDraft: false,
    onBlur: () => {},
    errorText: '',
    value: undefined,
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

        const values = {
            street: props.value ? props.value.trim() : '',
        };
        if (street && street.length >= values.street.length) {
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
        <ScrollView
            horizontal
            contentContainerStyle={[styles.flex1]}
            scrollEnabled={false}
        >
            <View style={[styles.w100]}>

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
                        url: `${CONFIG.EXPENSIFY.EXPENSIFY_URL}api?command=Proxy_GooglePlaces&proxyUrl=`,
                    }}
                    textInputProps={{
                        InputComp: TextInput,
                        ref: (node) => {
                            if (!props.innerRef) {
                                return;
                            }

                            if (_.isFunction(props.innerRef)) {
                                props.innerRef(node);
                                return;
                            }

                            // eslint-disable-next-line no-param-reassign
                            props.innerRef.current = node;
                        },
                        label: props.label,
                        containerStyles: props.containerStyles,
                        errorText: props.errorText,
                        value: props.value,
                        isFormInput: props.isFormInput,
                        inputID: props.inputID,
                        shouldSaveDraft: props.shouldSaveDraft,
                        onBlur: props.onBlur,
                        autoComplete: 'off',
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
            </View>
        </ScrollView>
    );
};

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;

export default withLocalize(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AddressSearch {...props} innerRef={ref} />
)));
