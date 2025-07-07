"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var buildSubstitutionsMap_1 = require("@src/components/Search/SearchRouter/buildSubstitutionsMap");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
jest.mock('@libs/ReportUtils', function () {
    return {
        parseReportRouteParams: jest.fn(function () { return ({}); }),
        // The `getReportName` method is quite complex, and we don't need to test it, we just want to test the logic around generating substitutionsMap
        getReportName: function (report) {
            return report.reportName;
        },
    };
});
var personalDetailsMock = {
    12345: {
        accountID: 12345,
        firstName: 'John',
        displayName: 'John Doe',
        login: 'johndoe@example.com',
    },
    78901: {
        accountID: 78901,
        firstName: 'Jane',
        displayName: 'Jane Doe',
        login: 'janedoe@example.com',
    },
};
var reportsMock = (_a = {},
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "rep123")] = {
        reportID: 'rep123',
        reportName: 'Report 1',
    },
    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT, "rep456")] = {
        reportID: 'rep456',
        reportName: 'Report 2',
    },
    _a);
var taxRatesMock = {
    TAX_1: ['id_TAX_1'],
};
var cardListMock = {
    '11223344': {
        state: 1,
        bank: 'vcf',
        lastFourPAN: '1234',
    },
};
var cardFeedNamesWithTypeMock = {
    'cards_11111111_Expensify Card': {
        name: 'All Expensify',
        type: 'workspace',
    },
    '12345678_Test Card': {
        name: 'All Cards',
        type: 'workspace',
    },
};
describe('buildSubstitutionsMap should return correct substitutions map', function () {
    test('when there were no substitutions', function () {
        var userQuery = 'foo bar';
        var result = (0, buildSubstitutionsMap_1.buildSubstitutionsMap)(userQuery, personalDetailsMock, reportsMock, taxRatesMock, {}, cardFeedNamesWithTypeMock, {});
        expect(result).toStrictEqual({});
    });
    test('when query has a single substitution', function () {
        var userQuery = 'foo from:12345';
        var result = (0, buildSubstitutionsMap_1.buildSubstitutionsMap)(userQuery, personalDetailsMock, reportsMock, taxRatesMock, {}, cardFeedNamesWithTypeMock, {});
        expect(result).toStrictEqual({
            'from:John Doe': '12345',
        });
    });
    test('when query has multiple substitutions of different types', function () {
        var userQuery = 'from:78901,12345 to:nonExistingGuy@mail.com cardID:11223344 in:rep123 taxRate:id_TAX_1 feed:"11111111_Expensify Card"';
        var result = (0, buildSubstitutionsMap_1.buildSubstitutionsMap)(userQuery, personalDetailsMock, reportsMock, taxRatesMock, cardListMock, cardFeedNamesWithTypeMock, {});
        expect(result).toStrictEqual({
            'from:Jane Doe': '78901',
            'from:John Doe': '12345',
            'in:Report 1': 'rep123',
            'cardID:Visa - 1234': '11223344',
            'taxRate:TAX_1': 'id_TAX_1',
            'feed:All Expensify': '11111111_Expensify Card',
        });
    });
});
