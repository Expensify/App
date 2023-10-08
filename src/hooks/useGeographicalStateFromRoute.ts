import {useRoute} from '@react-navigation/native';
import getStateFromRoute from '../libs/getStateFromRoute';

export default function useGeographicalStateFromRoute(stateParamName = 'state') {
    const route = useRoute();
    return getStateFromRoute(route, stateParamName);
}
