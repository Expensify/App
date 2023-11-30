import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Keyboard, LogBox, ScrollView, Text, View} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import _ from 'underscore';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import LocationErrorMessage from '@components/LocationErrorMessage';
import networkPropTypes from '@components/networkPropTypes';
import {withNetwork} from '@components/OnyxProvider';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import * as ApiUtils from '@libs/ApiUtils';
import compose from '@libs/compose';
import getCurrentPosition from '@libs/getCurrentPosition';
import * as GooglePlacesUtils from '@libs/GooglePlacesUtils';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CurrentLocationButton from './CurrentLocationButton';
import isCurrentTargetInsideContainer from './isCurrentTargetInsideContainer';

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
    errorText: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))]),

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

    /** A callback function when an address has been auto-selected */
    onPress: PropTypes.func,

    /** Customize the TextInput container */
    // eslint-disable-next-line react/forbid-prop-types
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Should address search be limited to results in the USA */
    isLimitedToUSA: PropTypes.bool,

    /** Shows a current location button in suggestion list */
    canUseCurrentLocation: PropTypes.bool,

    /** A list of predefined places that can be shown when the user isn't searching for something */
    predefinedPlaces: PropTypes.arrayOf(
        PropTypes.shape({
            /** A description of the location (usually the address) */
            description: PropTypes.string,

            /** The name of the location */
            name: PropTypes.string,

            /** Data required by the google auto complete plugin to know where to put the markers on the map */
            geometry: PropTypes.shape({
                /** Data about the location */
                location: PropTypes.shape({
                    /** Lattitude of the location */
                    lat: PropTypes.number,

                    /** Longitude of the location */
                    lng: PropTypes.number,
                }),
            }),
        }),
    ),

    /** A map of inputID key names */
    renamedInputKeys: PropTypes.shape({
        street: PropTypes.string,
        street2: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        lat: PropTypes.string,
        lng: PropTypes.string,
        zipCode: PropTypes.string,
    }),

    /** Maximum number of characters allowed in search input */
    maxInputLength: PropTypes.number,

    /** The result types to return from the Google Places Autocomplete request */
    resultTypes: PropTypes.string,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    inputID: undefined,
    shouldSaveDraft: false,
    onBlur: () => {},
    onPress: () => {},
    errorText: '',
    hint: '',
    value: undefined,
    defaultValue: undefined,
    containerStyles: [],
    isLimitedToUSA: false,
    canUseCurrentLocation: false,
    renamedInputKeys: {
        street: 'addressStreet',
        street2: 'addressStreet2',
        city: 'addressCity',
        state: 'addressState',
        zipCode: 'addressZipCode',
        lat: 'addressLat',
        lng: 'addressLng',
    },
    maxInputLength: undefined,
    predefinedPlaces: [],
    resultTypes: 'address',
};

function AddressSearch({
    canUseCurrentLocation,
    containerStyles,
    defaultValue,
    errorText,
    hint,
    innerRef,
    inputID,
    isLimitedToUSA,
    label,
    maxInputLength,
    network,
    onBlur,
    onInputChange,
    onPress,
    predefinedPlaces,
    preferredLocale,
    renamedInputKeys,
    resultTypes,
    shouldSaveDraft,
    translate,
    value,
}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [displayListViewBorder, setDisplayListViewBorder] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [searchValue, setSearchValue] = useState(value || defaultValue || '');
    const [locationErrorCode, setLocationErrorCode] = useState(null);
    const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
    const shouldTriggerGeolocationCallbacks = useRef(true);
    const containerRef = useRef();
    const query = useMemo(
        () => ({
            language: preferredLocale,
            types: resultTypes,
            components: isLimitedToUSA ? 'country:us' : undefined,
        }),
        [preferredLocale, resultTypes, isLimitedToUSA],
    );
    const shouldShowCurrentLocationButton = canUseCurrentLocation && searchValue.trim().length === 0 && isFocused;

    const saveLocationDetails = (autocompleteData, details) => {
        const addressComponents = details.address_components;
        if (!addressComponents) {
            // When there are details, but no address_components, this indicates that some predefined options have been passed
            // to this component which don't match the usual properties coming from auto-complete. In that case, only a limited
            // amount of data massaging needs to happen for what the parent expects to get from this function.
            if (_.size(details)) {
                onPress({
                    address: lodashGet(details, 'description'),
                    lat: lodashGet(details, 'geometry.location.lat', 0),
                    lng: lodashGet(details, 'geometry.location.lng', 0),
                    name: lodashGet(details, 'name'),
                });
            }
            return;
        }

        // Gather the values from the Google details
        const {
            street_number: streetNumber,
            route: streetName,
            subpremise,
            locality,
            sublocality,
            postal_town: postalTown,
            postal_code: zipCode,
            administrative_area_level_1: state,
            administrative_area_level_2: stateFallback,
            country: countryPrimary,
        } = GooglePlacesUtils.getAddressComponents(addressComponents, {
            street_number: 'long_name',
            route: 'long_name',
            subpremise: 'long_name',
            locality: 'long_name',
            sublocality: 'long_name',
            postal_town: 'long_name',
            postal_code: 'long_name',
            administrative_area_level_1: 'short_name',
            administrative_area_level_2: 'long_name',
            country: 'short_name',
        });

        // The state's iso code (short_name) is needed for the StatePicker component but we also
        // need the state's full name (long_name) when we render the state in a TextInput.
        const {administrative_area_level_1: longStateName} = GooglePlacesUtils.getAddressComponents(addressComponents, {
            administrative_area_level_1: 'long_name',
        });

        // Make sure that the order of keys remains such that the country is always set above the state.
        // Refer to https://github.com/Expensify/App/issues/15633 for more information.
        const {
            country: countryFallbackLongName = '',
            state: stateAutoCompleteFallback = '',
            city: cityAutocompleteFallback = '',
        } = GooglePlacesUtils.getPlaceAutocompleteTerms(autocompleteData.terms);

        const countryFallback = _.findKey(CONST.ALL_COUNTRIES, (country) => country === countryFallbackLongName);

        const country = countryPrimary || countryFallback;

        const values = {
            street: `${streetNumber} ${streetName}`.trim(),
            name: lodashGet(details, 'name', ''),
            // Autocomplete returns any additional valid address fragments (e.g. Apt #) as subpremise.
            street2: subpremise,
            // Make sure country is updated first, since city and state will be reset if the country changes
            country: '',
            state: state || stateAutoCompleteFallback,
            // When locality is not returned, many countries return the city as postalTown (e.g. 5 New Street
            // Square, London), otherwise as sublocality (e.g. 384 Court Street Brooklyn). If postalTown is
            // returned, the sublocality will be a city subdivision so shouldn't take precedence (e.g.
            // Salagatan, Upssala, Sweden).
            city: locality || postalTown || sublocality || cityAutocompleteFallback,
            zipCode,

            lat: lodashGet(details, 'geometry.location.lat', 0),
            lng: lodashGet(details, 'geometry.location.lng', 0),
            address: lodashGet(details, 'formatted_address', ''),
        };

        // If the address is not in the US, use the full length state name since we're displaying the address's
        // state / province in a TextInput instead of in a picker.
        if (country !== CONST.COUNTRY.US) {
            values.state = longStateName;
        }

        // UK addresses return countries (e.g. England) in the state field (administrative_area_level_1)
        // So we use a secondary field (administrative_area_level_2) as a fallback
        if (country === CONST.COUNTRY.GB) {
            values.state = stateFallback;
        }

        // Some edge-case addresses may lack both street_number and route in the API response, resulting in an empty "values.street"
        // We are setting up a fallback to ensure "values.street" is populated with a relevant value
        if (!values.street && details.adr_address) {
            const streetAddressRegex = /<span class="street-address">([^<]*)<\/span>/;
            const adr_address = details.adr_address.match(streetAddressRegex);
            const streetAddressFallback = lodashGet(adr_address, [1], null);
            if (streetAddressFallback) {
                values.street = streetAddressFallback;
            }
        }

        // Not all pages define the Address Line 2 field, so in that case we append any additional address details
        // (e.g. Apt #) to Address Line 1
        if (subpremise && typeof renamedInputKeys.street2 === 'undefined') {
            values.street += `, ${subpremise}`;
        }

        const isValidCountryCode = lodashGet(CONST.ALL_COUNTRIES, country);
        if (isValidCountryCode) {
            values.country = country;
        }

        if (inputID) {
            _.each(values, (inputValue, key) => {
                const inputKey = lodashGet(renamedInputKeys, key, key);
                if (!inputKey) {
                    return;
                }
                onInputChange(inputValue, inputKey);
            });
        } else {
            onInputChange(values);
        }

        onPress(values);
    };

    /** Gets the user's current location and registers success/error callbacks */
    const getCurrentLocation = () => {
        if (isFetchingCurrentLocation) {
            return;
        }

        setIsTyping(false);
        setIsFocused(false);
        setDisplayListViewBorder(false);
        setIsFetchingCurrentLocation(true);

        Keyboard.dismiss();

        getCurrentPosition(
            (successData) => {
                if (!shouldTriggerGeolocationCallbacks.current) {
                    return;
                }

                setIsFetchingCurrentLocation(false);
                setLocationErrorCode(null);

                const location = {
                    lat: successData.coords.latitude,
                    lng: successData.coords.longitude,
                    address: CONST.YOUR_LOCATION_TEXT,
                };
                onPress(location);
            },
            (errorData) => {
                if (!shouldTriggerGeolocationCallbacks.current) {
                    return;
                }

                setIsFetchingCurrentLocation(false);
                setLocationErrorCode(errorData.code);
            },
            {
                maximumAge: 0, // No cache, always get fresh location info
                timeout: 5000,
            },
        );
    };

    const renderHeaderComponent = () =>
        predefinedPlaces.length > 0 && (
            <>
                {/* This will show current location button in list if there are some recent destinations */}
                {shouldShowCurrentLocationButton && (
                    <CurrentLocationButton
                        onPress={getCurrentLocation}
                        isDisabled={network.isOffline}
                    />
                )}
                {!value && <Text style={[styles.textLabel, styles.colorMuted, styles.pv2, styles.ph3, styles.overflowAuto]}>{translate('common.recentDestinations')}</Text>}
            </>
        );

    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => {
            // If the component unmounts we don't want any of the callback for geolocation to run.
            shouldTriggerGeolocationCallbacks.current = false;
        };
    }, []);

    const listEmptyComponent = useCallback(
        () =>
            network.isOffline || !isTyping ? null : (
                <Text style={[styles.textLabel, styles.colorMuted, styles.pv4, styles.ph3, styles.overflowAuto]}>{translate('common.noResultsFound')}</Text>
            ),
        [network.isOffline, isTyping, styles, translate],
    );

    const listLoader = useCallback(
        () => (
            <View style={[styles.pv4]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size="small"
                />
            </View>
        ),
        [styles.pv4, theme.spinner],
    );

    return (
        /*
         * The GooglePlacesAutocomplete component uses a VirtualizedList internally,
         * and VirtualizedLists cannot be directly nested within other VirtualizedLists of the same orientation.
         * To work around this, we wrap the GooglePlacesAutocomplete component with a horizontal ScrollView
         * that has scrolling disabled and would otherwise not be needed
         */
        <>
            <ScrollView
                horizontal
                contentContainerStyle={styles.flex1}
                scrollEnabled={false}
                // keyboardShouldPersistTaps="always" is required for Android native,
                // otherwise tapping on a result doesn't do anything. More information
                // here: https://github.com/FaridSafi/react-native-google-places-autocomplete#use-inside-a-scrollview-or-flatlist
                keyboardShouldPersistTaps="always"
            >
                <View
                    style={styles.w100}
                    ref={containerRef}
                >
                    <GooglePlacesAutocomplete
                        disableScroll
                        fetchDetails
                        suppressDefaultStyles
                        enablePoweredByContainer={false}
                        predefinedPlaces={predefinedPlaces}
                        listEmptyComponent={listEmptyComponent}
                        listLoaderComponent={listLoader}
                        renderHeaderComponent={renderHeaderComponent}
                        renderRow={(data) => {
                            const title = data.isPredefinedPlace ? data.name : data.structured_formatting.main_text;
                            const subtitle = data.isPredefinedPlace ? data.description : data.structured_formatting.secondary_text;
                            return (
                                <View>
                                    {title && <Text style={[styles.googleSearchText]}>{title}</Text>}
                                    <Text style={[styles.textLabelSupporting]}>{subtitle}</Text>
                                </View>
                            );
                        }}
                        onPress={(data, details) => {
                            saveLocationDetails(data, details);
                            setIsTyping(false);

                            // After we select an option, we set displayListViewBorder to false to prevent UI flickering
                            setDisplayListViewBorder(false);
                            setIsFocused(false);

                            // Clear location error code after address is selected
                            setLocationErrorCode(null);
                        }}
                        query={query}
                        requestUrl={{
                            useOnPlatform: 'all',
                            url: network.isOffline ? null : ApiUtils.getCommandURL({command: 'Proxy_GooglePlaces&proxyUrl='}),
                        }}
                        textInputProps={{
                            InputComp: TextInput,
                            ref: (node) => {
                                if (!innerRef) {
                                    return;
                                }

                                if (_.isFunction(innerRef)) {
                                    innerRef(node);
                                    return;
                                }

                                // eslint-disable-next-line no-param-reassign
                                innerRef.current = node;
                            },
                            label,
                            containerStyles,
                            errorText,
                            hint: displayListViewBorder || (predefinedPlaces.length === 0 && shouldShowCurrentLocationButton) || (canUseCurrentLocation && isTyping) ? undefined : hint,
                            value,
                            defaultValue,
                            inputID,
                            shouldSaveDraft,
                            onFocus: () => {
                                setIsFocused(true);
                            },
                            onBlur: (event) => {
                                if (!isCurrentTargetInsideContainer(event, containerRef)) {
                                    setDisplayListViewBorder(false);
                                    setIsFocused(false);
                                    setIsTyping(false);
                                }
                                onBlur();
                            },
                            autoComplete: 'off',
                            onInputChange: (text) => {
                                setSearchValue(text);
                                setIsTyping(true);
                                if (inputID) {
                                    onInputChange(text);
                                } else {
                                    onInputChange({street: text});
                                }

                                // If the text is empty and we have no predefined places, we set displayListViewBorder to false to prevent UI flickering
                                if (_.isEmpty(text) && _.isEmpty(predefinedPlaces)) {
                                    setDisplayListViewBorder(false);
                                }
                            },
                            maxLength: maxInputLength,
                            spellCheck: false,
                            selectTextOnFocus: true,
                        }}
                        styles={{
                            textInputContainer: [styles.flexColumn],
                            listView: [StyleUtils.getGoogleListViewStyle(displayListViewBorder), styles.overflowAuto, styles.borderLeft, styles.borderRight, !isFocused && {height: 0}],
                            row: [styles.pv4, styles.ph3, styles.overflowAuto],
                            description: [styles.googleSearchText],
                            separator: [styles.googleSearchSeparator],
                        }}
                        numberOfLines={2}
                        isRowScrollable={false}
                        listHoverColor={theme.border}
                        listUnderlayColor={theme.buttonPressedBG}
                        onLayout={(event) => {
                            // We use the height of the element to determine if we should hide the border of the listView dropdown
                            // to prevent a lingering border when there are no address suggestions.
                            setDisplayListViewBorder(event.nativeEvent.layout.height > variables.googleEmptyListViewHeight);
                        }}
                        inbetweenCompo={
                            // We want to show the current location button even if there are no recent destinations
                            predefinedPlaces.length === 0 && shouldShowCurrentLocationButton ? (
                                <View style={[StyleUtils.getGoogleListViewStyle(true), styles.overflowAuto, styles.borderLeft, styles.borderRight]}>
                                    <CurrentLocationButton
                                        onPress={getCurrentLocation}
                                        isDisabled={network.isOffline}
                                    />
                                </View>
                            ) : (
                                <></>
                            )
                        }
                        placeholder=""
                    />
                    <LocationErrorMessage
                        onClose={() => setLocationErrorCode(null)}
                        locationErrorCode={locationErrorCode}
                    />
                </View>
            </ScrollView>
            {isFetchingCurrentLocation && <FullScreenLoadingIndicator />}
        </>
    );
}

AddressSearch.propTypes = propTypes;
AddressSearch.defaultProps = defaultProps;
AddressSearch.displayName = 'AddressSearch';

const AddressSearchWithRef = React.forwardRef((props, ref) => (
    <AddressSearch
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

AddressSearchWithRef.displayName = 'AddressSearchWithRef';

export default compose(withNetwork(), withLocalize)(AddressSearchWithRef);
