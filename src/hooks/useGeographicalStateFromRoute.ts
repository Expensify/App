import {useRoute} from '@react-navigation/native';
import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

type CustomParamList = ParamListBase & Record<string, Record<string, string>>;
type State = keyof typeof COMMON_CONST.STATES;

/**
 * Extracts the 'state' (default) query parameter from the route/ url and validates it against COMMON_CONST.STATES, returning its ISO code or `undefined`.
 * Example 1: Url: https://new.expensify.com/settings/profile/address?state=MO Returns: MO
 * Example 2: Url: https://new.expensify.com/settings/profile/address?state=ASDF Returns: undefined
 * Example 3: Url: https://new.expensify.com/settings/profile/address Returns: undefined
 * Example 4: Url: https://new.expensify.com/settings/profile/address?state=MO-hash-a12341 Returns: MO
 */
export default function useGeographicalStateFromRoute(stateParamName = 'state'): State | undefined {
    const route = useRoute<RouteProp<CustomParamList, string>>();
    const stateFromUrlTemp = route.params?.[stateParamName] as string | undefined;

    if (!stateFromUrlTemp) {
        return;
    }
    return COMMON_CONST.STATES[stateFromUrlTemp as State]?.stateISO;
}
