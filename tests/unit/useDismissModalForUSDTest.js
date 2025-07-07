"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("@testing-library/react-native");
var useDismissModalForUSD_1 = require("@hooks/useDismissModalForUSD");
var CONST_1 = require("@src/CONST");
describe('useDismissModalForUSD', function () {
    it('useDismissModalForUSD should dismiss currency modal when the currency changes to USD', function () {
        var _a = (0, react_native_1.renderHook)(function (_a) {
            var _b = _a.workspaceCurrency, workspaceCurrency = _b === void 0 ? CONST_1.default.CURRENCY.EUR : _b;
            return (0, useDismissModalForUSD_1.default)(workspaceCurrency);
        }, {
            initialProps: {},
        }), rerender = _a.rerender, result = _a.result;
        // Open the currency modal
        result.current[1](true);
        // When currency is updated to USD
        rerender({ workspaceCurrency: CONST_1.default.CURRENCY.USD });
        // Then the isCurrencyModalOpen state should be false
        expect(result.current[0]).toBe(false);
    });
});
