import CONST from '@src/CONST';

export default function getAvailableEuCountries(shouldAllowChange?: boolean, isEuCurrencySupported?: boolean): Record<string, string> {
    if (!isEuCurrencySupported) {
        return shouldAllowChange ? CONST.ALL_EUROPEAN_UNION_COUNTRIES : CONST.ALL_COUNTRIES;
    }
    const specificSet = new Set<string>(CONST.EXPENSIFY_EU_UK_SUPPORT_COUNTRIES);
    return Object.fromEntries(Object.entries(CONST.ALL_EUROPEAN_UNION_COUNTRIES).filter(([code]) => specificSet.has(code)));
}
