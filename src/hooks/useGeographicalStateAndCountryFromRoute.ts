import {useRoute} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';
import CONST from '@src/CONST';

type State = keyof typeof COMMON_CONST.STATES;
type Country = keyof typeof CONST.ALL_COUNTRIES;
type StateAndCountry = {state?: State; country?: Country};

/**
 * Extracts the 'state' and 'country' query parameters from the route/ url and validates it against COMMON_CONST.STATES and CONST.ALL_COUNTRIES.
 * Example 1: Url: https://new.expensify.com/settings/profile/address?state=MO Returns: state=MO
 * Example 2: Url: https://new.expensify.com/settings/profile/address?state=ASDF Returns: state=undefined
 * Example 3: Url: https://new.expensify.com/settings/profile/address Returns: state=undefined
 * Example 4: Url: https://new.expensify.com/settings/profile/address?state=MO-hash-a12341 Returns: state=MO
 * Similarly for country parameter.
 */
export default function useGeographicalStateAndCountryFromRoute(stateParamName = 'state', countryParamName = 'country'): StateAndCountry {
    const routeParams = useRoute().params as Record<string, string>;

    const stateFromUrlTemp = routeParams?.[stateParamName] as string | undefined;
    const countryFromUrlTemp = routeParams?.[countryParamName] as string | undefined;

    return {
        state: COMMON_CONST.STATES[stateFromUrlTemp as State]?.stateISO,
        country: Object.keys(CONST.ALL_COUNTRIES).find((country) => country === countryFromUrlTemp) as Country,
    };
}
