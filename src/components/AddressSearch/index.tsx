import React, {forwardRef, useEffect, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {ActivityIndicator, Keyboard, LogBox, View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import type {GooglePlaceData, GooglePlaceDetail} from 'react-native-google-places-autocomplete';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import LocationErrorMessage from '@components/LocationErrorMessage';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserLocation from '@libs/actions/UserLocation';
import * as ApiUtils from '@libs/ApiUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import type {GeolocationErrorCodeType} from '@libs/getCurrentPosition/getCurrentPosition.types';
import * as GooglePlacesUtils from '@libs/GooglePlacesUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import CurrentLocationButton from './CurrentLocationButton';
import isCurrentTargetInsideContainer from './isCurrentTargetInsideContainer';
import type {AddressSearchProps, PredefinedPlace} from './types';

/**
 * Check if the place matches the search by the place name or description.
 * @param search The search string for a place
 * @param place The place to check for a match on the search
 * @returns true if search is related to place, otherwise it returns false.
 */
function isPlaceMatchForSearch(search: string, place: PredefinedPlace): boolean {
    if (!search) {
        return true;
    }
    if (!place) {
        return false;
    }
    const fullSearchSentence = `${place.name ?? ''} ${place.description}`;
    return search.split(' ').every((searchTerm) => !searchTerm || fullSearchSentence.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()));
}

// The error that's being thrown below will be ignored until we fork the
// react-native-google-places-autocomplete repo and replace the
// VirtualizedList component with a VirtualizedList-backed instead
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

function AddressSearch(
    {
        canUseCurrentLocation = false,
        containerStyles,
        defaultValue,
        errorText = '',
        hint = '',
        inputID,
        isLimitedToUSA = false,
        label,
        maxInputLength,
        onFocus,
        onBlur,
        onInputChange,
        onPress,
        predefinedPlaces = [],
        preferredLocale,
        renamedInputKeys = {
            street: 'addressStreet',
            street2: 'addressStreet2',
            city: 'addressCity',
            state: 'addressState',
            zipCode: 'addressZipCode',
            lat: 'addressLat',
            lng: 'addressLng',
        },
        resultTypes = 'address',
        shouldSaveDraft = false,
        value,
        locationBias,
    }: AddressSearchProps,
    ref: ForwardedRef<HTMLElement>,
) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [displayListViewBorder, setDisplayListViewBorder] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [searchValue, setSearchValue] = useState('');
    const [locationErrorCode, setLocationErrorCode] = useState<GeolocationErrorCodeType>(null);
    const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false);
    const shouldTriggerGeolocationCallbacks = useRef(true);
    const [shouldHidePredefinedPlaces, setShouldHidePredefinedPlaces] = useState(false);
    const containerRef = useRef<View>(null);
    const query = useMemo(
        () => ({
            language: preferredLocale,
            types: resultTypes,
            components: isLimitedToUSA ? 'country:us' : undefined,
            ...(locationBias && {locationbias: locationBias}),
        }),
        [preferredLocale, resultTypes, isLimitedToUSA, locationBias],
    );
    const shouldShowCurrentLocationButton = canUseCurrentLocation && searchValue.trim().length === 0 && isFocused;
    const saveLocationDetails = (autocompleteData: GooglePlaceData, details: GooglePlaceDetail | null) => {
        const addressComponents = details?.address_components;
        if (!addressComponents) {
            // When there are details, but no address_components, this indicates that some predefined options have been passed
            // to this component which don't match the usual properties coming from auto-complete. In that case, only a limited
            // amount of data massaging needs to happen for what the parent expects to get from this function.
            if (details) {
                onPress?.({
                    address: autocompleteData.description ?? '',
                    lat: details.geometry.location.lat ?? 0,
                    lng: details.geometry.location.lng ?? 0,
                    name: details.name,
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
            // eslint-disable-next-line @typescript-eslint/naming-convention
            street_number: 'long_name',
            route: 'long_name',
            subpremise: 'long_name',
            locality: 'long_name',
            sublocality: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            postal_town: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            postal_code: 'long_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_1: 'short_name',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_2: 'long_name',
            country: 'short_name',
        });

        // The state's iso code (short_name) is needed for the StatePicker component but we also
        // need the state's full name (long_name) when we render the state in a TextInput.
        const {administrative_area_level_1: longStateName} = GooglePlacesUtils.getAddressComponents(addressComponents, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            administrative_area_level_1: 'long_name',
        });

        // Make sure that the order of keys remains such that the country is always set above the state.
        // Refer to https://github.com/Expensify/App/issues/15633 for more information.
        const {
            country: countryFallbackLongName = '',
            state: stateAutoCompleteFallback = '',
            city: cityAutocompleteFallback = '',
        } = GooglePlacesUtils.getPlaceAutocompleteTerms(autocompleteData?.terms ?? []);

        const countryFallback = Object.keys(CONST.ALL_COUNTRIES).find((country) => country === countryFallbackLongName);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const country = countryPrimary || countryFallback || '';

        const values = {
            street: `${streetNumber} ${streetName}`.trim(),
            name: details.name ?? '',
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

            lat: details.geometry.location.lat ?? 0,
            lng: details.geometry.location.lng ?? 0,
            address: autocompleteData.description || details.formatted_address || '',
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

        // Set the state to be the same as the city in case the state is empty.
        if (!values.state) {
            values.state = values.city;
        }

        // Some edge-case addresses may lack both street_number and route in the API response, resulting in an empty "values.street"
        // We are setting up a fallback to ensure "values.street" is populated with a relevant value
        if (!values.street && details.adr_address) {
            const streetAddressRegex = /<span class="street-address">([^<]*)<\/span>/;
            const adrAddress = details.adr_address.match(streetAddressRegex);
            const streetAddressFallback = adrAddress ? adrAddress?.[1] : null;
            if (streetAddressFallback) {
                values.street = streetAddressFallback;
            }
        }

        // Not all pages define the Address Line 2 field, so in that case we append any additional address details
        // (e.g. Apt #) to Address Line 1
        if (subpremise && typeof renamedInputKeys?.street2 === 'undefined') {
            values.street += `, ${subpremise}`;
        }

        const isValidCountryCode = !!Object.keys(CONST.ALL_COUNTRIES).find((foundCountry) => foundCountry === country);
        if (isValidCountryCode) {
            values.country = country;
        }

        if (inputID) {
            Object.entries(values).forEach(([key, inputValue]) => {
                const inputKey = renamedInputKeys?.[key as keyof Omit<Address, 'current'>] ?? key;
                if (!inputKey) {
                    return;
                }
                onInputChange?.(inputValue, inputKey);
            });
        } else {
            onInputChange?.(values);
        }

        onPress?.(values);
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

                const {latitude, longitude} = successData.coords;

                const location = {
                    lat: latitude,
                    lng: longitude,
                    address: CONST.YOUR_LOCATION_TEXT,
                    name: CONST.YOUR_LOCATION_TEXT,
                };

                // Update the current user location
                UserLocation.setUserLocation({longitude, latitude});
                onPress?.(location);
            },
            (errorData) => {
                if (!shouldTriggerGeolocationCallbacks.current) {
                    return;
                }

                setIsFetchingCurrentLocation(false);
                setLocationErrorCode(errorData?.code ?? null);
            },
            {
                maximumAge: 0, // No cache, always get fresh location info
                timeout: 30000,
            },
        );
    };

    const renderHeaderComponent = () => (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {(predefinedPlaces?.length ?? 0) > 0 && (
                <View style={styles.overflowAuto}>
                    {/* This will show current location button in list if there are some recent destinations */}
                    {shouldShowCurrentLocationButton && (
                        <CurrentLocationButton
                            onPress={getCurrentLocation}
                            isDisabled={isOffline}
                        />
                    )}
                    {!value && <Text style={[styles.textLabel, styles.colorMuted, styles.pv2, styles.ph3, styles.overflowAuto]}>{translate('common.recentDestinations')}</Text>}
                </View>
            )}
        </>
    );

    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        return () => {
            // If the component unmounts we don't want any of the callback for geolocation to run.
            shouldTriggerGeolocationCallbacks.current = false;
        };
    }, []);

    const filteredPredefinedPlaces = useMemo(() => {
        if (!searchValue) {
            return predefinedPlaces ?? [];
        } else if (shouldHidePredefinedPlaces) {
            return [];
        }
        return predefinedPlaces?.filter((predefinedPlace) => isPlaceMatchForSearch(searchValue, predefinedPlace)) ?? [];
    }, [predefinedPlaces, searchValue]);

    const listEmptyComponent = useMemo(
        () => (!isTyping ? undefined : <Text style={[styles.textLabel, styles.colorMuted, styles.pv4, styles.ph3, styles.overflowAuto]}>{translate('common.noResultsFound')}</Text>),
        [isTyping, styles, translate],
    );

    const listLoader = useMemo(
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
                        predefinedPlaces={filteredPredefinedPlaces}
                        listEmptyComponent={listEmptyComponent}
                        listLoaderComponent={listLoader}
                        renderHeaderComponent={renderHeaderComponent}
                        renderRow={(data) => {
                            const title = data.isPredefinedPlace ? data.name : data.structured_formatting.main_text;
                            const subtitle = data.isPredefinedPlace ? data.description : data.structured_formatting.secondary_text;
                            return (
                                <View>
                                    {!!title && <Text style={styles.googleSearchText}>{title}</Text>}
                                    <Text style={[title ? styles.textLabelSupporting : styles.googleSearchText]}>{subtitle}</Text>
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
                            url: isOffline ? '' : ApiUtils.getCommandURL({command: 'Proxy_GooglePlaces?proxyUrl='}),
                        }}
                        textInputProps={{
                            InputComp: TextInput,
                            ref,
                            label,
                            containerStyles,
                            errorText,
                            hint: displayListViewBorder || (predefinedPlaces?.length === 0 && shouldShowCurrentLocationButton) || (canUseCurrentLocation && isTyping) ? undefined : hint,
                            value,
                            defaultValue,
                            inputID,
                            shouldSaveDraft,
                            onFocus: () => {
                                setIsFocused(true);
                                onFocus?.();
                            },
                            onBlur: (event) => {
                                if (!isCurrentTargetInsideContainer(event, containerRef)) {
                                    setDisplayListViewBorder(false);
                                    setIsFocused(false);
                                    setIsTyping(false);
                                }
                                onBlur?.();
                            },
                            autoComplete: 'off',
                            onInputChange: (text: string) => {
                                setSearchValue(text);
                                setIsTyping(true);
                                setShouldHidePredefinedPlaces(!isOffline);
                                if (inputID) {
                                    onInputChange?.(text);
                                } else {
                                    onInputChange?.({street: text});
                                }
                                // If the text is empty and we have no predefined places, we set displayListViewBorder to false to prevent UI flickering
                                if (!text && !predefinedPlaces?.length) {
                                    setDisplayListViewBorder(false);
                                }
                            },
                            maxLength: maxInputLength,
                            spellCheck: false,
                            selectTextOnFocus: true,
                        }}
                        styles={{
                            textInputContainer: [styles.flexColumn],
                            listView: [StyleUtils.getGoogleListViewStyle(displayListViewBorder), styles.borderLeft, styles.borderRight, !isFocused && styles.h0],
                            row: [styles.pv4, styles.ph3, styles.overflowAuto],
                            description: [styles.googleSearchText],
                            separator: [styles.googleSearchSeparator, styles.overflowAuto],
                            container: [styles.mh100],
                        }}
                        numberOfLines={2}
                        isRowScrollable={false}
                        listHoverColor={theme.border}
                        listUnderlayColor={theme.buttonPressedBG}
                        onLayout={(event: LayoutChangeEvent) => {
                            // We use the height of the element to determine if we should hide the border of the listView dropdown
                            // to prevent a lingering border when there are no address suggestions.
                            setDisplayListViewBorder(event.nativeEvent.layout.height > variables.googleEmptyListViewHeight);
                        }}
                        inbetweenCompo={
                            // We want to show the current location button even if there are no recent destinations
                            predefinedPlaces?.length === 0 && shouldShowCurrentLocationButton ? (
                                <View style={[StyleUtils.getGoogleListViewStyle(true), styles.overflowAuto, styles.borderLeft, styles.borderRight]}>
                                    <CurrentLocationButton
                                        onPress={getCurrentLocation}
                                        isDisabled={isOffline}
                                    />
                                </View>
                            ) : undefined
                        }
                        placeholder=""
                        listViewDisplayed
                    >
                        <LocationErrorMessage
                            onClose={() => setLocationErrorCode(null)}
                            locationErrorCode={locationErrorCode}
                        />
                    </GooglePlacesAutocomplete>
                </View>
            </ScrollView>
            {isFetchingCurrentLocation && <FullScreenLoadingIndicator />}
        </>
    );
}

AddressSearch.displayName = 'AddressSearchWithRef';

export default forwardRef(AddressSearch);

export type {AddressSearchProps};
