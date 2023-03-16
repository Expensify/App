import _ from 'underscore';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {LogBox, ScrollView, View} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import lodashGet from 'lodash/get';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import TextInput from './TextInput';
import * as ApiUtils from '../libs/ApiUtils';
import * as GooglePlacesUtils from '../libs/GooglePlacesUtils';
import CONST from '../CONST';

// The error that's being thrown below will be ignored until we fork the
// react-native-google-places-autocomplete repo and replace the
// VirtualizedList component with a VirtualizedList-backed instead
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

const propTypes = {
    /** The ID used to uniquely identify the input in a Form */
    inputID: PropTypes.string,

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Callback that is called when the text input is blurred */
    onBlur: PropTypes.func,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Hint text to display */
    hint: PropTypes.string,

    /** The label to display for the field */
    label: PropTypes.string.isRequired,

    /** The value to set the field to initially */
    value: PropTypes.string,

    /** The value to set the field to initially */
    defaultValue: PropTypes.string,

    /** A callback function when the value of this field has changed */
    onInputChange: PropTypes.func.isRequired,

    /** Customize the TextInput container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Should address search be limited to results in the USA */
    isLimitedToUSA: PropTypes.bool,

    /** A map of inputID key names */
    renamedInputKeys: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zipCode: PropTypes.string,
    }),

    /** Maximum number of characters allowed in search input */
    maxInputLength: PropTypes.number,

    ...withLocalizePropTypes,
};

const defaultProps = {
    inputID: undefined,
    shouldSaveDraft: false,
    onBlur: () => {},
    errorText: '',
    hint: '',
    value: undefined,
    defaultValue: undefined,
    containerStyles: [],
    isLimitedToUSA: true,
    renamedInputKeys: {
        street: 'addressStreet',
        city: 'addressCity',
        state: 'addressState',
        zipCode: 'addressZipCode',
    },
    maxInputLength: undefined,
};

// Do not convert to class component! It's been tried before and presents more challenges than it's worth.
// Relevant thread: https://expensify.slack.com/archives/C03TQ48KC/p1634088400387400
// Reference: https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/609#issuecomment-886133839
const AddressSearch = (props) => {
    const [displayListViewBorder, setDisplayListViewBorder] = useState(false);
    const query = {language: props.preferredLocale, types: 'address'};
    if (props.isLimitedToUSA) {
        query.components = 'country:us';
    }

    const saveLocationDetails = (details) => {
        const addressComponents = details.address_components;
        if (!addressComponents) {
            return;
        }

        // Gather the values from the Google details
        const {
            street_number: streetNumber,
            route: streetName,
            locality: city,
            sublocality: cityFallback, // Some locations only return sublocality instead of locality
            postal_code: zipCode,
            administrative_area_level_1: state,
            country,
        } = GooglePlacesUtils.getAddressComponents(addressComponents, {
            street_number: 'long_name',
            route: 'long_name',
            locality: 'long_name',
            sublocality: 'long_name',
            postal_code: 'long_name',
            administrative_area_level_1: 'short_name',
            country: 'short_name',
        });

        // The state's iso code (short_name) is needed for the StatePicker component but we also
        // need the state's full name (long_name) when we render the state in a TextInput.
        const {
            administrative_area_level_1: longStateName,
        } = GooglePlacesUtils.getAddressComponents(addressComponents, {
            administrative_area_level_1: 'long_name',
        });

        const values = {
            street: props.value ? props.value.trim() : '',
            city: city || cityFallback,
            zipCode,
            state,
            country: '',
        };

        // If the address is not in the US, use the full length state name since we're displaying the address's
        // state / province in a TextInput instead of in a picker.
        if (country !== CONST.COUNTRY.US) {
            values.state = longStateName;
        }

        const street = `${streetNumber} ${streetName}`.trim();
        if (street && street.length >= values.street.length) {
            // We are only passing the street number and name if the combined length is longer than the value
            // that was initially passed to the autocomplete component. Google Places can truncate details
            // like Apt # and this is the best way we have to tell that the new value it's giving us is less
            // specific than the one the user entered manually.
            values.street = street;
        }

        const isValidCountryCode = lodashGet(CONST.ALL_COUNTRIES, country);
        if (isValidCountryCode) {
            values.country = country;
        }

        if (props.inputID) {
            _.each(values, (value, key) => {
                const inputKey = lodashGet(props.renamedInputKeys, key, key);
                props.onInputChange(value, inputKey);
            });
        } else {
            props.onInputChange(values);
        }
    };

    return (

        /*
         * The GooglePlacesAutocomplete component uses a VirtualizedList internally,
         * and VirtualizedLists cannot be directly nested within other VirtualizedLists of the same orientation.
         * To work around this, we wrap the GooglePlacesAutocomplete component with a horizontal ScrollView
         * that has scrolling disabled and would otherwise not be needed
         */
        <ScrollView
            horizontal
            contentContainerStyle={styles.flex1}
            scrollEnabled={false}

            // keyboardShouldPersistTaps="always" is required for Android native,
            // otherwise tapping on a result doesn't do anything. More information
            // here: https://github.com/FaridSafi/react-native-google-places-autocomplete#use-inside-a-scrollview-or-flatlist
            keyboardShouldPersistTaps="always"
        >
            <View style={styles.w100}>
                <GooglePlacesAutocomplete
                    disableScroll
                    fetchDetails
                    suppressDefaultStyles
                    enablePoweredByContainer={false}
                    onPress={(data, details) => {
                        saveLocationDetails(details);

                        // After we select an option, we set displayListViewBorder to false to prevent UI flickering
                        setDisplayListViewBorder(false);
                    }}
                    query={query}
                    requestUrl={{
                        useOnPlatform: 'all',
                        url: ApiUtils.getCommandURL({command: 'Proxy_GooglePlaces&proxyUrl='}),
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
                        hint: displayListViewBorder ? undefined : props.hint,
                        value: props.value,
                        defaultValue: props.defaultValue,
                        inputID: props.inputID,
                        shouldSaveDraft: props.shouldSaveDraft,
                        onBlur: props.onBlur,
                        autoComplete: 'off',
                        onInputChange: (text) => {
                            if (props.inputID) {
                                props.onInputChange(text);
                            } else {
                                props.onInputChange({street: text});
                            }

                            // If the text is empty, we set displayListViewBorder to false to prevent UI flickering
                            if (_.isEmpty(text)) {
                                setDisplayListViewBorder(false);
                            }
                        },
                        maxLength: props.maxInputLength,
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
                    listHoverColor={themeColors.border}
                    listUnderlayColor={themeColors.buttonPressedBG}
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
AddressSearch.displayName = 'AddressSearch';

export default withLocalize(React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AddressSearch {...props} innerRef={ref} />
)));
