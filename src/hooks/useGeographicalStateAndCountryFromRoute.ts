import CONST from '@src/CONST';
import {isRecord} from '@src/libs/ObjectUtils';

import {useRoute} from '@react-navigation/native';
import {CONST as COMMON_CONST} from 'expensify-common';

type State = keyof typeof COMMON_CONST.STATES;
type Country = keyof typeof CONST.ALL_COUNTRIES;
type StateAndCountry = {state?: State; country?: Country};

function isState(value: string): value is State {
    return Object.hasOwn(COMMON_CONST.STATES, value);
}

function isCountry(value: string): value is Country {
    return Object.hasOwn(CONST.ALL_COUNTRIES, value);
}

/**
 * Extracts the 'state' and 'country' query parameters from the route/ url and validates it against COMMON_CONST.STATES and CONST.ALL_COUNTRIES.
 * Example 1: Url: https://new.expensify.com/settings/profile/address?state=MO Returns: state=MO
 * Example 2: Url: https://new.expensify.com/settings/profile/address?state=ASDF Returns: state=undefined
 * Example 3: Url: https://new.expensify.com/settings/profile/address Returns: state=undefined
 * Example 4: Url: https://new.expensify.com/settings/profile/address?state=MO-hash-a12341 Returns: state=undefined
 * Similarly for country parameter.
 */
export default function useGeographicalStateAndCountryFromRoute(stateParamName = 'state', countryParamName = 'country'): StateAndCountry {
    const routeParams = useRoute().params;

    if (!isRecord(routeParams)) {
        return {state: undefined, country: undefined};
    }

    const stateFromUrl = routeParams[stateParamName];
    const countryFromUrl = routeParams[countryParamName];

    return {
        state: typeof stateFromUrl === 'string' && isState(stateFromUrl) ? COMMON_CONST.STATES[stateFromUrl].stateISO : undefined,
        country: typeof countryFromUrl === 'string' && isCountry(countryFromUrl) ? countryFromUrl : undefined,
    };
}
