function findBestLanguageTag() {
    return {languageTag: 'en-US', isRTL: false};
}

const RNLocalize = {
    getLocales: () => [{languageCode: 'en', countryCode: 'US', languageTag: 'en-US', isRTL: false}],
    getNumberFormatSettings: () => ({
        decimalSeparator: '.',
        groupingSeparator: ',',
    }),
    getCalendar: () => 'gregorian',
    getCountry: () => 'US',
    getCurrencies: () => ['USD'],
    getTemperatureUnit: () => 'celsius',
    getTimeZone: () => 'America/Los_Angeles',
    uses24HourClock: () => false,
    usesMetricSystem: () => false,
    findBestLanguageTag,
};

export {findBestLanguageTag};
export default RNLocalize;
