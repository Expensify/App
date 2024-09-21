import type {RefObject} from 'react';
import type {NativeSyntheticEvent, StyleProp, TextInputFocusEventData, View, ViewStyle} from 'react-native';
import type {Place} from 'react-native-google-places-autocomplete';
import type Locale from '@src/types/onyx/Locale';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type CurrentLocationButtonProps = {
    /** Callback that is called when the button is clicked */
    onPress?: () => void;

    /** Boolean to indicate if the button is clickable */
    isDisabled?: boolean;
};

type OnPressProps = {
    address: string;
    lat: number;
    lng: number;
    name: string;
};

type StreetValue = {
    street: string;
};

type PredefinedPlace = Place & {
    name?: string;
};

type LocationBias = {
    rectangle: {
        low: {
            latitude: number,
            longitude: number,
        },
        high: {
            latitude: number,
            longitude: number,
        }
    }
};

type AddressSearchProps = {
    /** The ID used to uniquely identify the input in a Form */
    inputID?: string;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** Callback that is called when the text input is focused */
    onFocus?: () => void;

    /** Callback that is called when the text input is blurred */
    onBlur?: () => void;

    /** Error text to display */
    errorText?: string;

    /** Hint text to display */
    hint?: string;

    /** The label to display for the field */
    label: string;

    /** The value to set the field to initially */
    value?: string;

    /** The value to set the field to initially */
    defaultValue?: string;

    /** A callback function when the value of this field has changed */
    onInputChange?: (value: string | number | Address | StreetValue, key?: string) => void;

    /** A callback function when an address has been auto-selected */
    onPress?: (props: OnPressProps) => void;

    /** Customize the TextInput container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Should address search be limited to results in the USA */
    isLimitedToUSA?: boolean;

    /** Shows a current location button in suggestion list */
    canUseCurrentLocation?: boolean;

    /** A list of predefined places that can be shown when the user isn't searching for something */
    predefinedPlaces?: PredefinedPlace[] | null;

    /** A map of inputID key names */
    renamedInputKeys?: Address;

    /** Maximum number of characters allowed in search input */
    maxInputLength?: number;

    /** The result types to return from the Google Places Autocomplete request */
    resultTypes?: string;

    /** Location bias for querying search results. */
    locationBias?: LocationBias | undefined;

    /** The user's preferred locale e.g. 'en', 'es-ES' */
    preferredLocale?: Locale;
};

type IsCurrentTargetInsideContainerType = (event: FocusEvent | NativeSyntheticEvent<TextInputFocusEventData>, containerRef: RefObject<View | HTMLElement>) => boolean;

export type {CurrentLocationButtonProps, AddressSearchProps, IsCurrentTargetInsideContainerType, StreetValue, PredefinedPlace};
