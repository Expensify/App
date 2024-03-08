import {useRoute} from '@react-navigation/native';
import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';

type CustomParamList = ParamListBase & Record<string, Record<string, string>>;
type State = keyof typeof COMMON_CONST.STATES;

/**
 *  See {@link module:src/pages/settings/Profile/PersonalDetails/StateSelectionPage.tsx#withHash} for more information.
 */
const removeHash = (arg: string): string => arg.replace(/-hash-.*$/, '');

/**
 * Extracts the 'state' (default) query parameter from the route/ url and validates it against COMMON_CONST.STATES, returning its ISO code or `undefined`.
 * Example: const stateISO = useGeographicalStateFromRoute(); // Assuming 'state' param is 'CA' or another valid state, returns the corresponding ISO code or `undefined` if invalid.
 */
export default function useGeographicalStateFromRoute(stateParamName = 'state'): State | undefined {
    const route = useRoute<RouteProp<CustomParamList, string>>();
    const stateFromUrlTemp = route.params?.[stateParamName] as string | undefined;

    if (!stateFromUrlTemp) {
        return;
    }
    return COMMON_CONST.STATES[removeHash(stateFromUrlTemp) as State].stateISO;
}
