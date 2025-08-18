import CONST from '@src/CONST';

const euUkSupportedCountrySet = new Set<string>(CONST.EXPENSIFY_EU_UK_SUPPORT_COUNTRIES);
const europeanCountries = Object.entries(CONST.EUROPEAN_UNION_COUNTRIES_WITH_GB);

export default function getAvailableEuCountries(shouldAllowChange?: boolean, isEuCurrencySupported?: boolean): Record<string, string> {
    if (!isEuCurrencySupported) {
        return shouldAllowChange ? CONST.ALL_EUROPEAN_UNION_COUNTRIES : CONST.ALL_COUNTRIES;
    }
    return Object.fromEntries(europeanCountries.filter(([code]) => specificSet.has(code)));
}
