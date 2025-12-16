import type {ForwardedRef, RefObject} from 'react';
import type {BlurEvent, StyleProp, View, ViewStyle} from 'react-native';
import type {Place} from 'react-native-google-places-autocomplete';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import type {Country} from '@src/CONST';
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

type AddressSearchProps = ForwardedFSClassProps & {
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

    /** Should address search results be limited to specific country */
    limitSearchesToCountry?: Country | '';

    /** Shows a current location button in suggestion list */
    canUseCurrentLocation?: boolean;

    /** A list of predefined places that can be shown when the user isn't searching for something */
    predefinedPlaces?: PredefinedPlace[] | null;

    /** A map of inputID key names */
    renamedInputKeys?: Record<string, string>;

    /** Maximum number of characters allowed in search input */
    maxInputLength?: number;

    /** The result types to return from the Google Places Autocomplete request */
    resultTypes?: string;

    /** Location bias for querying search results. */
    locationBias?: string;

    /** Callback to be called when the country is changed */
    onCountryChange?: (country: unknown) => void;

    /** If true, caret is hidden. The default value is false. */
    caretHidden?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<HTMLElement>;
};

type IsCurrentTargetInsideContainerType = (event: FocusEvent | BlurEvent, containerRef: RefObject<View | HTMLElement | null>) => boolean;

export type {CurrentLocationButtonProps, AddressSearchProps, IsCurrentTargetInsideContainerType, StreetValue, PredefinedPlace};
