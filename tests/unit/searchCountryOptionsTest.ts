import searchOptions from '@libs/searchOptions';

describe('searchCountryOptions', () => {
    test('when the search term is a country code, the country with that code should be prioritized', () => {
        const searchValue = 'US';
        const countriesData = [
            {
                value: 'US',
                keyForList: 'US',
                text: 'United States',
                isSelected: false,
                searchValue: 'usunitedstates',
            },
            {
                value: 'CA',
                keyForList: 'CA',
                text: 'Canada',
                isSelected: false,
                searchValue: 'cacanada',
            },
            {
                value: 'MX',
                keyForList: 'MX',
                text: 'Mexico',
                isSelected: false,
                searchValue: 'mxmexico',
            },
            {
                value: 'AU',
                keyForList: 'AU',
                text: 'Australia',
                isSelected: false,
                searchValue: 'auaustralia',
            },
        ];
        const expected = [
            {
                value: 'US',
                keyForList: 'US',
                text: 'United States',
                isSelected: false,
                searchValue: 'usunitedstates',
            },
            {
                value: 'AU',
                keyForList: 'AU',
                text: 'Australia',
                isSelected: false,
                searchValue: 'auaustralia',
            },
        ];
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains diacritics the country names that exactly match should be prioritized', () => {
        const searchValue = 'Ål';
        const countriesData = [
            {
                value: 'AX',
                keyForList: 'AX',
                text: 'Åland Islands',
                isSelected: false,
                searchValue: 'axalandislands',
            },
            {
                value: 'AL',
                keyForList: 'AL',
                text: 'Albania',
                isSelected: false,
                searchValue: 'alalbania',
            },
            {
                value: 'AS',
                keyForList: 'AS',
                text: 'American Samoa',
                isSelected: false,
                searchValue: 'asamericansamoa',
            },
        ];
        const expected = [
            {
                value: 'AX',
                keyForList: 'AX',
                text: 'Åland Islands',
                isSelected: false,
                searchValue: 'axalandislands',
            },
            {
                value: 'AL',
                keyForList: 'AL',
                text: 'Albania',
                isSelected: false,
                searchValue: 'alalbania',
            },
        ];
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains diacritics the country names that exactly match should be prioritized, test case #2', () => {
        const searchValue = 'é';
        const countriesData = [
            {
                value: 'BE',
                keyForList: 'BE',
                text: 'Belgium',
                isSelected: false,
                searchValue: 'bebelgium',
            },
            {
                value: 'US',
                keyForList: 'US',
                text: 'United States',
                isSelected: false,
                searchValue: 'usunitedstates',
            },
            {
                value: 'BL',
                keyForList: 'BL',
                text: 'Saint Barthélemy',
                isSelected: false,
                searchValue: 'blsaintbarthelemy',
            },
        ];
        const expected = [
            {
                value: 'BL',
                keyForList: 'BL',
                text: 'Saint Barthélemy',
                isSelected: false,
                searchValue: 'blsaintbarthelemy',
            },
            {
                value: 'BE',
                keyForList: 'BE',
                text: 'Belgium',
                isSelected: false,
                searchValue: 'bebelgium',
            },
            {
                value: 'US',
                keyForList: 'US',
                text: 'United States',
                isSelected: false,
                searchValue: 'usunitedstates',
            },
        ];
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains no diacritics, countries with diacritics should still be searched by their sanitized names', () => {
        const searchValue = 'al';
        const countriesData = [
            {
                value: 'AX',
                keyForList: 'AX',
                text: 'Åland Islands',
                isSelected: false,
                searchValue: 'axalandislands',
            },
            {
                value: 'AL',
                keyForList: 'AL',
                text: 'Albania',
                isSelected: false,
                searchValue: 'alalbania',
            },
            {
                value: 'AS',
                keyForList: 'AS',
                text: 'American Samoa',
                isSelected: false,
                searchValue: 'asamericansamoa',
            },
        ];
        const expected = [
            {
                value: 'AL',
                keyForList: 'AL',
                text: 'Albania',
                isSelected: false,
                searchValue: 'alalbania',
            },
            {
                value: 'AX',
                keyForList: 'AX',
                text: 'Åland Islands',
                isSelected: false,
                searchValue: 'axalandislands',
            },
        ];
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when a search term exactly matches the beginning of a countries name, that country should be prioritized', () => {
        const searchValue = 'bar'; // for barbados
        const countriesData = [
            {
                value: 'BB',
                keyForList: 'BB',
                text: 'Barbados',
                isSelected: false,
                searchValue: 'bbbarbados',
            },
            {
                value: 'BY',
                keyForList: 'BY',
                text: 'Belarus',
                isSelected: false,
                searchValue: 'bybelarus',
            },
            {
                value: 'BE',
                keyForList: 'BE',
                text: 'Belgium',
                isSelected: false,
                searchValue: 'bebelgium',
            },
            {
                value: 'AG',
                keyForList: 'AG',
                text: 'Antigua and Barbuda',
                isSelected: false,
                searchValue: 'agantiguaandbarbuda',
            },
        ];
        const expected = [
            {
                value: 'BB',
                keyForList: 'BB',
                text: 'Barbados',
                isSelected: false,
                searchValue: 'bbbarbados',
            },
            {
                value: 'AG',
                keyForList: 'AG',
                text: 'Antigua and Barbuda',
                isSelected: false,
                searchValue: 'agantiguaandbarbuda',
            },
        ];
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term is empty, all countries should be returned', () => {
        const searchValue = '';
        const countriesData = [
            {
                value: 'BB',
                keyForList: 'BB',
                text: 'Barbados',
                isSelected: false,
                searchValue: 'bbbarbados',
            },
            {
                value: 'BY',
                keyForList: 'BY',
                text: 'Belarus',
                isSelected: false,
                searchValue: 'bybelarus',
            },
            {
                value: 'BE',
                keyForList: 'BE',
                text: 'Belgium',
                isSelected: false,
                searchValue: 'bebelgium',
            },
            {
                value: 'AG',
                keyForList: 'AG',
                text: 'Antigua and Barbuda',
                isSelected: false,
                searchValue: 'agantiguaandbarbuda',
            },
        ];
        const expected = countriesData;
        const actual = searchOptions(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
});
