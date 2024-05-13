import {useRoute} from '@react-navigation/native';
import type {ParamListBase, RouteProp} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import CONST from '@src/CONST';

type CustomParamList = ParamListBase & Record<string, Record<string, string>>;
type State = keyof typeof COMMON_CONST.STATES;
type Country = keyof typeof CONST.ALL_COUNTRIES;
type StateAndCountry = {state?: State; country?: Country};

/**
 * Extracts the 'state' (default) query parameter from the route/ url and validates it against COMMON_CONST.STATES, returning its ISO code or `undefined`.
 * Example 1: Url: https://new.expensify.com/settings/profile/address?state=MO Returns: MO
 * Example 2: Url: https://new.expensify.com/settings/profile/address?state=ASDF Returns: undefined
 * Example 3: Url: https://new.expensify.com/settings/profile/address Returns: undefined
 * Example 4: Url: https://new.expensify.com/settings/profile/address?state=MO-hash-a12341 Returns: MO
 */
export default function useGeographicalStateAndCountryFromRoute(stateParamName = 'state', countryParamName = 'country'): StateAndCountry | undefined {
    const route = useRoute<RouteProp<CustomParamList, string>>();
    const stateFromUrlTemp = route.params?.[stateParamName] as string | undefined;
    const countryFromUrlTemp = route.params?.[countryParamName] as string | undefined;

    return {
        state: COMMON_CONST.STATES[stateFromUrlTemp as State]?.stateISO,
        country: Object.keys(CONST.ALL_COUNTRIES).find((country) => country === countryFromUrlTemp) as Country,
    };
}
