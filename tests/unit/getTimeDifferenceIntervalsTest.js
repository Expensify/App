"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var PerDiemRequestUtils_1 = require("@libs/PerDiemRequestUtils");
describe('getTimeDifferenceIntervals', function () {
    var createMockTransaction = function (startDate, endDate) {
        return ({
            comment: {
                customUnit: {
                    attributes: {
                        dates: {
                            start: startDate,
                            end: endDate,
                        },
                    },
                },
            },
        });
    };
    it('calculates hours for same-day transactions', function () {
        // Given a transaction that starts and ends on the same day
        var startDate = '2024-03-20T09:00:00Z';
        var endDate = '2024-03-20T17:00:00Z';
        var transaction = createMockTransaction(startDate, endDate);
        var result = (0, PerDiemRequestUtils_1.getTimeDifferenceIntervals)(transaction);
        // When we calculate the time difference intervals
        var expectedHours = (0, date_fns_1.differenceInMinutes)(new Date(endDate), new Date(startDate)) / 60;
        // Then we should get the correct number of hours for a single day, there should be no trip days and no last day
        expect(result).toEqual({
            firstDay: expectedHours,
            tripDays: 0,
            lastDay: undefined,
        });
    });
    it('calculates hours spanning two days', function () {
        // Given a transaction that spans across two days
        var startDate = '2024-03-20T14:00:00Z';
        var endDate = '2024-03-21T16:00:00Z';
        var transaction = createMockTransaction(startDate, endDate);
        var result = (0, PerDiemRequestUtils_1.getTimeDifferenceIntervals)(transaction);
        // When we calculate the time difference intervals
        var startDateTime = new Date(startDate);
        var firstDayDiff = (0, date_fns_1.differenceInMinutes)((0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(startDateTime, 1)), startDateTime);
        var lastDayDiff = (0, date_fns_1.differenceInMinutes)(new Date(endDate), (0, date_fns_1.startOfDay)(new Date(endDate)));
        // Then we should get the correct split of hours, there should be no trip days
        expect(result).toEqual({
            firstDay: firstDayDiff / 60,
            tripDays: 0,
            lastDay: lastDayDiff / 60,
        });
    });
    it('calculates hours for multi-day trips', function () {
        // Given a transaction that spans multiple days
        var startDate = '2024-03-20T16:00:00Z';
        var endDate = '2024-03-23T14:00:00Z';
        var transaction = createMockTransaction(startDate, endDate);
        var result = (0, PerDiemRequestUtils_1.getTimeDifferenceIntervals)(transaction);
        // When we calculate the time difference intervals
        var startDateTime = new Date(startDate);
        var firstDayDiff = (0, date_fns_1.differenceInMinutes)((0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(startDateTime, 1)), startDateTime);
        var tripDaysDiff = (0, date_fns_1.differenceInDays)((0, date_fns_1.startOfDay)(new Date(endDate)), (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(startDateTime, 1)));
        var lastDayDiff = (0, date_fns_1.differenceInMinutes)(new Date(endDate), (0, date_fns_1.startOfDay)(new Date(endDate)));
        // Then we should get the correct hours split, there should be trip days and last day
        expect(result).toEqual({
            firstDay: firstDayDiff / 60,
            tripDays: tripDaysDiff,
            lastDay: lastDayDiff / 60,
        });
    });
});
