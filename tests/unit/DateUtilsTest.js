"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var react_native_onyx_1 = require("react-native-onyx");
var DateUtils_1 = require("@libs/DateUtils");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var LOCALE = CONST_1.default.LOCALES.EN;
var UTC = 'UTC';
describe('DateUtils', function () {
    beforeAll(function () {
        var _a;
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            initialKeyStates: (_a = {},
                _a[ONYXKEYS_1.default.SESSION] = {
                    accountID: 999,
                },
                _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = {
                    '999': {
                        accountID: 999,
                        timezone: {
                            // UTC is not recognized as a valid timezone but
                            // in these tests we want to use it to avoid issues
                            // because of daylight saving time
                            selected: UTC,
                        },
                    },
                },
                _a),
        });
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () {
        IntlStore_1.default.load(LOCALE);
        return (0, waitForBatchedUpdates_1.default)();
    });
    afterEach(function () {
        jest.restoreAllMocks();
        jest.useRealTimers();
        react_native_onyx_1.default.clear();
    });
    var datetime = '2022-11-07 00:00:00';
    var timezone = 'America/Los_Angeles';
    it('getZoneAbbreviation should show zone abbreviation from the datetime', function () {
        var zoneAbbreviation = DateUtils_1.default.getZoneAbbreviation(datetime, timezone);
        expect(zoneAbbreviation).toBe('GMT-8');
    });
    it('formatToLongDateWithWeekday should return a long date with a weekday', function () {
        var formattedDate = DateUtils_1.default.formatToLongDateWithWeekday(datetime);
        expect(formattedDate).toBe('Monday, November 7, 2022');
    });
    it('formatToDayOfWeek should return a weekday', function () {
        var weekDay = DateUtils_1.default.formatToDayOfWeek(new Date(datetime));
        expect(weekDay).toBe('Monday');
    });
    it('formatToLocalTime should return a date in a local format', function () {
        var localTime = DateUtils_1.default.formatToLocalTime(datetime);
        expect(localTime).toBe('12:00 AM');
    });
    it('should return a date object with the formatted datetime when calling getLocalDateFromDatetime', function () {
        var localDate = DateUtils_1.default.getLocalDateFromDatetime(LOCALE, datetime, timezone);
        expect((0, date_fns_tz_1.format)(localDate, CONST_1.default.DATE.FNS_TIMEZONE_FORMAT_STRING, { timeZone: timezone })).toEqual('2022-11-06T16:00:00-08:00');
    });
    it('should fallback to current date when getLocalDateFromDatetime is failing', function () {
        var localDate = DateUtils_1.default.getLocalDateFromDatetime(LOCALE, undefined, 'InvalidTimezone');
        expect(localDate.getTime()).not.toBeNaN();
    });
    it('should return the date in calendar time when calling datetimeToCalendarTime', function () {
        var today = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(new Date(), 14), 32).toString();
        expect(DateUtils_1.default.datetimeToCalendarTime(LOCALE, today)).toBe('Today at 2:32 PM');
        var tomorrow = (0, date_fns_1.addDays)((0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(new Date(), 14), 32), 1).toString();
        expect(DateUtils_1.default.datetimeToCalendarTime(LOCALE, tomorrow)).toBe('Tomorrow at 2:32 PM');
        var yesterday = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)((0, date_fns_1.subDays)(new Date(), 1), 7), 43).toString();
        expect(DateUtils_1.default.datetimeToCalendarTime(LOCALE, yesterday)).toBe('Yesterday at 7:43 AM');
        var date = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(new Date('2022-11-05'), 10), 17).toString();
        expect(DateUtils_1.default.datetimeToCalendarTime(LOCALE, date)).toBe('Nov 5, 2022 at 10:17 AM');
        var todayLowercaseDate = (0, date_fns_1.setMinutes)((0, date_fns_1.setHours)(new Date(), 14), 32).toString();
        expect(DateUtils_1.default.datetimeToCalendarTime(LOCALE, todayLowercaseDate, false, undefined, true)).toBe('today at 2:32 PM');
    });
    it('should update timezone if automatic and selected timezone do not match', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
                        return ({
                            resolvedOptions: function () { return ({ timeZone: 'America/Chicago' }); },
                        });
                    });
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { '999': { accountID: 999, timezone: { selected: 'Europe/London', automatic: true } } });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    result = DateUtils_1.default.getCurrentTimezone();
                    expect(result).toEqual({
                        selected: 'America/Chicago',
                        automatic: true,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('should not update timezone if automatic and selected timezone match', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
                        return ({
                            resolvedOptions: function () { return ({ timeZone: UTC }); },
                        });
                    });
                    react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { '999': { accountID: 999, timezone: { selected: 'Europe/London', automatic: true } } });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    result = DateUtils_1.default.getCurrentTimezone();
                    expect(result).toEqual({
                        selected: UTC,
                        automatic: true,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('canUpdateTimezone should return true when lastUpdatedTimezoneTime is more than 5 minutes ago', function () {
        // Use fake timers to control the current time
        jest.useFakeTimers();
        jest.setSystemTime((0, date_fns_1.addMinutes)(new Date(), 6));
        var isUpdateTimezoneAllowed = DateUtils_1.default.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(true);
    });
    it('canUpdateTimezone should return false when lastUpdatedTimezoneTime is less than 5 minutes ago', function () {
        // Use fake timers to control the current time
        jest.useFakeTimers();
        DateUtils_1.default.setTimezoneUpdated();
        jest.setSystemTime((0, date_fns_1.addMinutes)(new Date(), 4));
        var isUpdateTimezoneAllowed = DateUtils_1.default.canUpdateTimezone();
        expect(isUpdateTimezoneAllowed).toBe(false);
    });
    it('should return the date in calendar time when calling datetimeToRelative', function () {
        var aFewSecondsAgo = (0, date_fns_1.subSeconds)(new Date(), 10).toString();
        expect(DateUtils_1.default.datetimeToRelative(LOCALE, aFewSecondsAgo)).toBe('less than a minute ago');
        var aMinuteAgo = (0, date_fns_1.subMinutes)(new Date(), 1).toString();
        expect(DateUtils_1.default.datetimeToRelative(LOCALE, aMinuteAgo)).toBe('1 minute ago');
        var anHourAgo = (0, date_fns_1.subHours)(new Date(), 1).toString();
        expect(DateUtils_1.default.datetimeToRelative(LOCALE, anHourAgo)).toBe('about 1 hour ago');
    });
    it('subtractMillisecondsFromDateTime should subtract milliseconds from a given date and time', function () {
        var initialDateTime = '2023-07-18T10:30:00Z';
        var millisecondsToSubtract = 5000; // 5 seconds
        var expectedDateTime = '2023-07-18 10:29:55.000';
        var result = DateUtils_1.default.subtractMillisecondsFromDateTime(initialDateTime, millisecondsToSubtract);
        expect(result).toBe(expectedDateTime);
    });
    describe('Date Comparison Functions', function () {
        var today = new Date();
        var tomorrow = (0, date_fns_1.addDays)(today, 1);
        var yesterday = (0, date_fns_1.subDays)(today, 1);
        var todayInTimezone = (0, date_fns_tz_1.toZonedTime)(today, timezone);
        var tomorrowInTimezone = (0, date_fns_tz_1.toZonedTime)(tomorrow, timezone);
        var yesterdayInTimezone = (0, date_fns_tz_1.toZonedTime)(yesterday, timezone);
        it('isToday should correctly identify today', function () {
            expect(DateUtils_1.default.isToday(todayInTimezone, timezone)).toBe(true);
            expect(DateUtils_1.default.isToday(tomorrowInTimezone, timezone)).toBe(false);
            expect(DateUtils_1.default.isToday(yesterdayInTimezone, timezone)).toBe(false);
        });
        it('isTomorrow should correctly identify tomorrow', function () {
            expect(DateUtils_1.default.isTomorrow(tomorrowInTimezone, timezone)).toBe(true);
            expect(DateUtils_1.default.isTomorrow(todayInTimezone, timezone)).toBe(false);
            expect(DateUtils_1.default.isTomorrow(yesterdayInTimezone, timezone)).toBe(false);
        });
        it('isYesterday should correctly identify yesterday', function () {
            expect(DateUtils_1.default.isYesterday(yesterdayInTimezone, timezone)).toBe(true);
            expect(DateUtils_1.default.isYesterday(todayInTimezone, timezone)).toBe(false);
            expect(DateUtils_1.default.isYesterday(tomorrowInTimezone, timezone)).toBe(false);
        });
    });
    describe('getDBTime', function () {
        it('should return the date in the format expected by the database', function () {
            var getDBTime = DateUtils_1.default.getDBTime();
            expect(getDBTime).toBe((0, date_fns_1.format)(new Date(getDBTime), CONST_1.default.DATE.FNS_DB_FORMAT_STRING));
        });
        it('should represent the correct date in utc when used with a standard datetime string', function () {
            var timestamp = 'Mon Nov 21 2022 19:04:14 GMT-0800 (Pacific Standard Time)';
            var getDBTime = DateUtils_1.default.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:04:14.000');
        });
        it('should represent the correct date in time when used with an ISO string', function () {
            var timestamp = '2022-11-22T03:08:04.326Z';
            var getDBTime = DateUtils_1.default.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:08:04.326');
        });
        it('should represent the correct date in time when used with a unix timestamp', function () {
            var timestamp = 1669086850792;
            var getDBTime = DateUtils_1.default.getDBTime(timestamp);
            expect(getDBTime).toBe('2022-11-22 03:14:10.792');
        });
    });
    describe('formatWithUTCTimeZone', function () {
        describe('when the date is invalid', function () {
            it('returns an empty string', function () {
                var invalidDateStr = '';
                var formattedDate = DateUtils_1.default.formatWithUTCTimeZone(invalidDateStr);
                expect(formattedDate).toEqual('');
            });
        });
        describe('when the date is valid', function () {
            var scenarios = [
                { dateFormat: CONST_1.default.DATE.FNS_FORMAT_STRING, expectedResult: '2022-11-07' },
                { dateFormat: CONST_1.default.DATE.FNS_TIMEZONE_FORMAT_STRING, expectedResult: '2022-11-07T00:00:00Z' },
                { dateFormat: CONST_1.default.DATE.FNS_DB_FORMAT_STRING, expectedResult: '2022-11-07 00:00:00.000' },
            ];
            test.each(scenarios)('returns the date as string with the format "$dateFormat"', function (_a) {
                var dateFormat = _a.dateFormat, expectedResult = _a.expectedResult;
                var formattedDate = DateUtils_1.default.formatWithUTCTimeZone(datetime, dateFormat);
                expect(formattedDate).toEqual(expectedResult);
            });
        });
        it('returns the correct date when the date with time is used', function () {
            var datetimeStr = '2022-11-07 17:48:00';
            var expectedResult = '2022-11-07';
            expect(DateUtils_1.default.formatWithUTCTimeZone(datetimeStr)).toEqual(expectedResult);
        });
    });
    describe('getLastBusinessDayOfMonth', function () {
        var scenarios = [
            {
                // Last business day of May in 2025
                inputDate: new Date(2025, 4),
                expectedResult: 30,
            },
            {
                // Last business day  of February in 2024
                inputDate: new Date(2024, 2),
                expectedResult: 29,
            },
            {
                // Last business day of January in 2024
                inputDate: new Date(2024, 0),
                expectedResult: 31,
            },
            {
                // Last business day of September in 2023
                inputDate: new Date(2023, 8),
                expectedResult: 29,
            },
        ];
        test.each(scenarios)('returns a last business day based on the input date', function (_a) {
            var inputDate = _a.inputDate, expectedResult = _a.expectedResult;
            var lastBusinessDay = DateUtils_1.default.getLastBusinessDayOfMonth(inputDate);
            expect(lastBusinessDay).toEqual(expectedResult);
        });
    });
    describe('isCardExpired', function () {
        it('should return true when the card is expired', function () {
            var cardMonth = 1;
            var cardYear = new Date().getFullYear() - 1;
            expect(DateUtils_1.default.isCardExpired(cardMonth, cardYear)).toBe(true);
        });
        it('should return false when the card is not expired', function () {
            var cardMonth = 1;
            var cardYear = new Date().getFullYear() + 1;
            expect(DateUtils_1.default.isCardExpired(cardMonth, cardYear)).toBe(false);
        });
    });
    describe('isCurrentTimeWithinRange', function () {
        beforeAll(function () {
            jest.useFakeTimers();
        });
        afterAll(function () {
            jest.useRealTimers();
        });
        it('should return true when current time is within the range', function () {
            var currentTime = new Date(datetime);
            jest.setSystemTime(currentTime);
            var startTime = '2022-11-06T10:00:00Z';
            var endTime = '2022-11-07T14:00:00Z';
            expect(DateUtils_1.default.isCurrentTimeWithinRange(startTime, endTime)).toBe(true);
        });
        it('should return false when current time is before the range', function () {
            var currentTime = new Date(datetime);
            jest.setSystemTime(currentTime);
            var startTime = '2022-11-07T10:00:00Z';
            var endTime = '2022-11-07T14:00:00Z';
            expect(DateUtils_1.default.isCurrentTimeWithinRange(startTime, endTime)).toBe(false);
        });
        it('should return false when current time is after the range', function () {
            var currentTime = new Date(datetime);
            jest.setSystemTime(currentTime);
            var startTime = '2022-11-06T10:00:00Z';
            var endTime = '2022-11-06T14:00:00Z';
            expect(DateUtils_1.default.isCurrentTimeWithinRange(startTime, endTime)).toBe(false);
        });
    });
});
