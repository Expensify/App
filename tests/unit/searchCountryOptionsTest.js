"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var searchOptions_1 = require("@libs/searchOptions");
describe('searchCountryOptions', function () {
    test('when the search term is a country code, the country with that code should be prioritized', function () {
        var searchValue = 'US';
        var countriesData = [
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
        var expected = [
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
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains diacritics the country names that exactly match should be prioritized', function () {
        var searchValue = 'Ål';
        var countriesData = [
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
        var expected = [
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
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains diacritics the country names that exactly match should be prioritized, test case #2', function () {
        var searchValue = 'é';
        var countriesData = [
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
        var expected = [
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
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term contains no diacritics, countries with diacritics should still be searched by their sanitized names', function () {
        var searchValue = 'al';
        var countriesData = [
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
        var expected = [
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
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when a search term exactly matches the beginning of a countries name, that country should be prioritized', function () {
        var searchValue = 'bar'; // for barbados
        var countriesData = [
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
        var expected = [
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
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
    test('when the search term is empty, all countries should be returned', function () {
        var searchValue = '';
        var countriesData = [
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
        var expected = countriesData;
        var actual = (0, searchOptions_1.default)(searchValue, countriesData);
        expect(actual).toEqual(expected);
    });
});
