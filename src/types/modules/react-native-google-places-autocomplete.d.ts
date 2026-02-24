import type {ViewProps} from 'react-native';
import type {GooglePlacesAutocompleteProps as BaseGooglePlacesAutocompleteProps, Term} from 'react-native-google-places-autocomplete';

declare module 'react-native-google-places-autocomplete' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface GooglePlacesAutocompleteProps extends ViewProps, BaseGooglePlacesAutocompleteProps {}

    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface GooglePlaceData {
        isPredefinedPlace: string;
        name: string;
        description: string;
        terms?: Term[];
    }
}
