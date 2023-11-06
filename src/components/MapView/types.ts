import {OnyxEntry} from 'react-native-onyx';
import * as OnyxTypes from '@src/types/onyx';
import {MapViewProps} from './MapViewTypes';

type MapViewOnyxProps = {
    userLocation: OnyxEntry<OnyxTypes.UserLocation>;
};

type ComponentProps = MapViewProps & MapViewOnyxProps;

export type {MapViewOnyxProps, ComponentProps};
