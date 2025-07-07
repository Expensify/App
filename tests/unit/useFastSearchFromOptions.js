"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var useFastSearchFromOptions_1 = require("@hooks/useFastSearchFromOptions");
var ahmedPersonalDetail = {
    login: 'ahmed@example.com',
    text: 'Ahmed Gaber',
    participantsList: [
        {
            displayName: 'Ahmed Gaber',
        },
    ],
};
var ahmedReport = {
    reportID: '1',
    text: 'Ahmed Gaber (Report)',
};
var fabioPersonalDetail = {
    login: 'fabio.john@example.com',
    text: 'Fábio John',
    participantsList: [
        {
            displayName: 'Fábio John',
        },
    ],
};
var fabioReport = {
    reportID: '4',
    text: 'Fábio, John (Report)',
};
var options = {
    currentUserOption: null,
    userToInvite: null,
    personalDetails: [
        ahmedPersonalDetail,
        {
            login: 'banana@example.com',
            text: 'Banana',
            participantsList: [
                {
                    displayName: 'Banana',
                },
            ],
        },
    ],
    recentReports: [
        ahmedReport,
        {
            reportID: '2',
            text: 'Something else',
        },
        {
            reportID: '3',
            // This starts with Ah as well, but should not match
            text: 'Aha',
        },
    ],
};
var nonLatinOptions = {
    currentUserOption: null,
    userToInvite: null,
    personalDetails: [fabioPersonalDetail],
    recentReports: [fabioReport],
};
describe('useFastSearchFromOptions', function () {
    it('should return sub word matches', function () {
        var result = (0, react_native_1.renderHook)(function () { return (0, useFastSearchFromOptions_1.default)(options); }).result;
        var search = result.current.search;
        var _a = search('Ah Ga'), personalDetails = _a.personalDetails, recentReports = _a.recentReports;
        expect(personalDetails).toEqual([ahmedPersonalDetail]);
        expect(recentReports).toEqual([ahmedReport]);
    });
    it('should return reports/personalDetails with non-latin characters', function () {
        var result = (0, react_native_1.renderHook)(function () { return (0, useFastSearchFromOptions_1.default)(nonLatinOptions); }).result;
        var search = result.current.search;
        var _a = search('Fabio'), personalDetails = _a.personalDetails, recentReports = _a.recentReports;
        expect(personalDetails).toEqual([fabioPersonalDetail]);
        expect(recentReports).toEqual([fabioReport]);
    });
    it('should return reports/personalDetails with multiple word query and non-latin character', function () {
        var result = (0, react_native_1.renderHook)(function () { return (0, useFastSearchFromOptions_1.default)(nonLatinOptions); }).result;
        var search = result.current.search;
        var _a = search('John Fabio'), recentReports = _a.recentReports, personalDetails = _a.personalDetails;
        expect(personalDetails).toEqual([fabioPersonalDetail]);
        expect(recentReports).toEqual([fabioReport]);
    });
});
