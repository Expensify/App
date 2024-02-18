import {useRoute} from '@react-navigation/native';
import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

type CustomParamList = ParamListBase & Record<string, Record<string, string>>;
type State = keyof typeof COMMON_CONST.STATES;

export default function useGeographicalStateFromRoute(stateParamName = 'state'): State | undefined {
    const route = useRoute<RouteProp<CustomParamList, string>>();
    const stateFromUrlTemp = route.params?.[stateParamName] as string | undefined;

    if (!stateFromUrlTemp) {
        return;
    }
    return COMMON_CONST.STATES[stateFromUrlTemp as State].stateISO;
}
