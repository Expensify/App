"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PerDiemRequestUtils_1 = require("@libs/PerDiemRequestUtils");
describe('PerDiemRequestUtils', function () {
    it('getDestinationListSections()', function () {
        var tokenizeSearch = 'Antigua Barbuda';
        var destinations = [
            {
                currency: 'EUR',
                customUnitRateID: 'Afghanistan',
                enabled: true,
                name: 'Afghanistan',
                rate: 0,
            },
            {
                currency: 'EUR',
                customUnitRateID: 'Antigua and Barbuda',
                enabled: true,
                name: 'Antigua and Barbuda',
                rate: 0,
            },
        ];
        var searchResultList = [
            {
                data: [
                    {
                        currency: 'EUR',
                        isDisabled: false,
                        isSelected: false,
                        keyForList: 'Antigua and Barbuda',
                        searchText: 'Antigua and Barbuda',
                        text: 'Antigua and Barbuda',
                        tooltipText: 'Antigua and Barbuda',
                    },
                ],
                indexOffset: 1,
                shouldShow: true,
                title: '',
            },
        ];
        var tokenizeSearchResult = (0, PerDiemRequestUtils_1.getDestinationListSections)({
            destinations: destinations,
            searchValue: tokenizeSearch,
        });
        expect(tokenizeSearchResult).toStrictEqual(searchResultList);
    });
});
