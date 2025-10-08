import CONST from '@src/CONST';

const ukEuSupportedCountrySet = new Set<string>(CONST.EXPENSIFY_UK_EU_SUPPORTED_COUNTRIES);
const europeanCountries = Object.entries(CONST.EUROPEAN_UNION_COUNTRIES_WITH_GB);

export default function getAvailableEuCountries(): Record<string, string> {
    return Object.fromEntries(europeanCountries.filter(([code]) => ukEuSupportedCountrySet.has(code)));
}
