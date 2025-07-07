"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_native_1 = require("@testing-library/react-native");
var date_fns_1 = require("date-fns");
var CalendarPicker_1 = require("@components/DatePicker/CalendarPicker");
var DateUtils_1 = require("@libs/DateUtils");
var monthNames = DateUtils_1.default.getMonthNames();
jest.mock('@react-navigation/native', function () { return (__assign(__assign({}, jest.requireActual('@react-navigation/native')), { useNavigation: function () { return ({ navigate: jest.fn() }); }, createNavigationContainerRef: jest.fn() })); });
jest.mock('../../src/hooks/useLocalize', function () {
    return jest.fn(function () { return ({
        translate: jest.fn(),
    }); });
});
jest.mock('@src/components/ConfirmedRoute.tsx');
describe('CalendarPicker', function () {
    test('renders calendar component', function () {
        (0, react_native_1.render)(<CalendarPicker_1.default />);
    });
    test('displays the current month and year', function () {
        var currentDate = new Date();
        var maxDate = (0, date_fns_1.addYears)(new Date(currentDate), 1);
        var minDate = (0, date_fns_1.subYears)(new Date(currentDate), 1);
        (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate} minDate={minDate}/>);
        expect(react_native_1.screen.getByText(monthNames[currentDate.getMonth()])).toBeTruthy();
        expect(react_native_1.screen.getByText(currentDate.getFullYear().toString())).toBeTruthy();
    });
    test('clicking next month arrow updates the displayed month', function () {
        var _a;
        var minDate = new Date('2022-01-01');
        var maxDate = new Date('2030-01-01');
        (0, react_native_1.render)(<CalendarPicker_1.default minDate={minDate} maxDate={maxDate}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId('next-month-arrow'));
        var nextMonth = (0, date_fns_1.addMonths)(new Date(), 1).getMonth();
        expect(react_native_1.screen.getByText((_a = monthNames.at(nextMonth)) !== null && _a !== void 0 ? _a : '')).toBeTruthy();
    });
    test('clicking previous month arrow updates the displayed month', function () {
        var _a;
        (0, react_native_1.render)(<CalendarPicker_1.default />);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId('prev-month-arrow'));
        var prevMonth = (0, date_fns_1.subMonths)(new Date(), 1).getMonth();
        expect(react_native_1.screen.getByText((_a = monthNames.at(prevMonth)) !== null && _a !== void 0 ? _a : '')).toBeTruthy();
    });
    test('clicking a day updates the selected date', function () {
        var onSelectedMock = jest.fn();
        var minDate = new Date('2022-01-01');
        var maxDate = new Date('2030-01-01');
        var value = '2023-01-01';
        (0, react_native_1.render)(<CalendarPicker_1.default value={value} minDate={minDate} maxDate={maxDate} onSelected={onSelectedMock}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByText('15'));
        expect(onSelectedMock).toHaveBeenCalledWith('2023-01-15');
        expect(onSelectedMock).toHaveBeenCalledTimes(1);
    });
    test('clicking previous month arrow and selecting day updates the selected date', function () {
        var onSelectedMock = jest.fn();
        var value = '2022-01-01';
        var minDate = new Date('2022-01-01');
        var maxDate = new Date('2030-01-01');
        (0, react_native_1.render)(<CalendarPicker_1.default value={value} minDate={minDate} maxDate={maxDate} onSelected={onSelectedMock}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByTestId('next-month-arrow'));
        react_native_1.fireEvent.press(react_native_1.screen.getByText('15'));
        expect(onSelectedMock).toHaveBeenCalledWith('2022-02-15');
    });
    test('should block the back arrow when there is no available dates in the previous month', function () { return __awaiter(void 0, void 0, void 0, function () {
        var minDate, value, user, prevMonth;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    minDate = new Date('2003-02-01');
                    value = new Date('2003-02-17');
                    // given the min date is 1
                    (0, react_native_1.render)(<CalendarPicker_1.default minDate={minDate} value={value}/>);
                    user = react_native_1.userEvent.setup();
                    return [4 /*yield*/, user.press(react_native_1.screen.getByTestId('prev-month-arrow'))];
                case 1:
                    _b.sent();
                    prevMonth = (0, date_fns_1.subMonths)(value, 1).getMonth();
                    expect(react_native_1.screen.queryByText((_a = monthNames.at(prevMonth)) !== null && _a !== void 0 ? _a : '')).not.toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should block the next arrow when there is no available dates in the next month', function () { return __awaiter(void 0, void 0, void 0, function () {
        var maxDate, value, user, nextMonth;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    maxDate = new Date('2003-02-24');
                    value = new Date('2003-02-17');
                    (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate} value={value}/>);
                    user = react_native_1.userEvent.setup();
                    return [4 /*yield*/, user.press(react_native_1.screen.getByTestId('next-month-arrow'))];
                case 1:
                    _b.sent();
                    nextMonth = (0, date_fns_1.addMonths)(value, 1).getMonth();
                    expect(react_native_1.screen.queryByText((_a = monthNames.at(nextMonth)) !== null && _a !== void 0 ? _a : '')).not.toBeOnTheScreen();
                    return [2 /*return*/];
            }
        });
    }); });
    test('should allow navigating to the month of the max date when it has less days than the selected date', function () {
        var maxDate = new Date('2003-11-27'); // This month has 30 days
        var value = '2003-10-31';
        // given the max date is 27
        (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate} value={value}/>);
        // then the next arrow should be enabled
        expect(react_native_1.screen.getByTestId('next-month-arrow')).toBeEnabled();
    });
    test('should open the calendar on a month from max date if it is earlier than current month', function () {
        var onSelectedMock = jest.fn();
        var maxDate = new Date('2011-03-01');
        (0, react_native_1.render)(<CalendarPicker_1.default onSelected={onSelectedMock} maxDate={maxDate}/>);
        react_native_1.fireEvent.press(react_native_1.screen.getByText('1'));
        expect(onSelectedMock).toHaveBeenCalledWith('2011-03-01');
    });
    test('should open the calendar on a year from max date if it is earlier than current year', function () {
        var maxDate = new Date('2011-03-01');
        (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate}/>);
        expect((0, react_native_1.within)(react_native_1.screen.getByTestId('currentYearText')).getByText('2011')).toBeTruthy();
    });
    test('should open the calendar on a month from min date if it is later than current month', function () {
        var minDate = new Date('2035-02-16');
        var maxDate = new Date('2040-02-16');
        (0, react_native_1.render)(<CalendarPicker_1.default minDate={minDate} maxDate={maxDate}/>);
        expect((0, react_native_1.within)(react_native_1.screen.getByTestId('currentYearText')).getByText(minDate.getFullYear().toString())).toBeTruthy();
    });
    test('should not allow to press earlier day than minDate', function () {
        var value = '2003-02-17';
        var minDate = new Date('2003-02-16');
        var onSelectedMock = jest.fn();
        // given the min date is 16
        (0, react_native_1.render)(<CalendarPicker_1.default minDate={minDate} value={value} onSelected={onSelectedMock}/>);
        //  When the day 15 is pressed
        react_native_1.fireEvent.press(react_native_1.screen.getByLabelText('15'));
        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();
        // When the day 16 is pressed
        react_native_1.fireEvent.press(react_native_1.screen.getByLabelText('16'));
        // Then the onSelected should be called as the label 16 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-16');
    });
    test('should not allow to press later day than max', function () {
        var value = '2003-02-17';
        var maxDate = new Date('2003-02-24');
        var onSelectedMock = jest.fn();
        // given the max date is 24
        (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate} value={value} onSelected={onSelectedMock}/>);
        //  When the day 25 is pressed
        react_native_1.fireEvent.press(react_native_1.screen.getByLabelText('25'));
        // Then the onSelected should not be called as the label 15 is disabled
        expect(onSelectedMock).not.toHaveBeenCalled();
        // When the day 24 is pressed
        react_native_1.fireEvent.press(react_native_1.screen.getByLabelText('24'));
        // Then the onSelected should be called as the label 24 is enabled
        expect(onSelectedMock).toHaveBeenCalledWith('2003-02-24');
    });
    test('should allow to press min date', function () {
        var value = '2003-02-17';
        var minDate = new Date('2003-02-16');
        // given the min date is 16
        (0, react_native_1.render)(<CalendarPicker_1.default minDate={minDate} value={value}/>);
        // then the label 16 should be clickable
        expect(react_native_1.screen.getByLabelText('16')).toBeEnabled();
    });
    test('should allow to press max date', function () {
        var value = '2003-02-17';
        var maxDate = new Date('2003-02-24');
        // given the max date is 24
        (0, react_native_1.render)(<CalendarPicker_1.default maxDate={maxDate} value={value}/>);
        // then the label 24 should be clickable
        expect(react_native_1.screen.getByLabelText('24')).toBeEnabled();
    });
});
