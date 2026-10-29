import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getSupportedCardCountriesForCurrency} from '@libs/CardUtils';

import CONST from '@src/CONST';

import type {OnyxEntry} from 'react-native-onyx';

const europeanCountries = Object.entries(CONST.EUROPEAN_UNION_COUNTRIES_WITH_GB);

export default function getAvailableCardCountryOptions(
    supportedCountriesByCurrency: OnyxEntry<Record<string, string[]>>,
    currency: string | undefined,
    localeCompare: LocaleContextProps['localeCompare'],
): Record<string, string> {
    const supportedCountrySet = new Set<string>(getSupportedCardCountriesForCurrency(supportedCountriesByCurrency, currency));
    return Object.fromEntries(europeanCountries.filter(([code]) => supportedCountrySet.has(code)).sort(([, nameA], [, nameB]) => localeCompare(nameA, nameB)));
}
