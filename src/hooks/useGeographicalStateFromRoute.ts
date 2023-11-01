import {ParamListBase, RouteProp, useRoute} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

type CustomParamList = ParamListBase & Record<string, Record<string, string>>;

export default function useGeographicalStateFromRoute(stateParamName = 'state') {
    const route = useRoute<RouteProp<CustomParamList, string>>();
    const stateFromUrlTemp = route.params?.[stateParamName] as string | undefined;

    if (!stateFromUrlTemp) {
        return '';
    }
    return COMMON_CONST.STATES[stateFromUrlTemp as keyof typeof COMMON_CONST.STATES] ? stateFromUrlTemp : '';
}
