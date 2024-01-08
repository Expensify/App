import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';
import type {MapViewProps} from './MapViewTypes';

type MapViewOnyxProps = {
    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
};

type ComponentProps = MapViewProps & MapViewOnyxProps;

export type {MapViewOnyxProps, ComponentProps};
