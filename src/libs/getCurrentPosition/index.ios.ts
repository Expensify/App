import Geolocation from '@react-native-community/geolocation';
import type {GetCurrentPosition} from './getCurrentPosition.types';

Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
    locationProvider: 'auto',
});

const getCurrentPosition: GetCurrentPosition = (success, error, config) => {
    Geolocation.getCurrentPosition(success, error, config);
};

export default getCurrentPosition;
