"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var useActiveRoute_1 = require("@hooks/useActiveRoute");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
describe('useActiveRoute', function () {
    it('should return the same active route', function () {
        // Given an active route
        var navigation = jest.spyOn(Navigation_1.default, 'getReportRHPActiveRoute');
        var result = (0, react_native_1.renderHook)(function () { return (0, useActiveRoute_1.default)(); }).result;
        var expectedActiveRoute = ROUTES_1.default.SEARCH_REPORT.getRoute({ reportID: '1' });
        navigation.mockReturnValueOnce(expectedActiveRoute);
        var actualActiveRoute = result.current.getReportRHPActiveRoute();
        expect(actualActiveRoute).toBe(expectedActiveRoute);
        // When getting the active route multiple times
        navigation.mockReturnValueOnce(ROUTES_1.default.MONEY_REQUEST_STEP_DESCRIPTION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.CREATE, '1', '1'));
        var actualActiveRoute2 = result.current.getReportRHPActiveRoute();
        // Then it should return the first active route value
        expect(actualActiveRoute2).toBe(expectedActiveRoute);
    });
});
