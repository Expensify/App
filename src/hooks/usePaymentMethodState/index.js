"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var initialState = {
    isSelectedPaymentMethodDefault: false,
    selectedPaymentMethod: {},
    formattedSelectedPaymentMethod: {
        title: '',
    },
    methodID: '',
    selectedPaymentMethodType: '',
};
function usePaymentMethodState() {
    var _a = (0, react_1.useState)(initialState), paymentMethod = _a[0], setPaymentMethod = _a[1];
    var resetSelectedPaymentMethodData = (0, react_1.useCallback)(function () {
        setPaymentMethod(initialState);
    }, [setPaymentMethod]);
    return {
        paymentMethod: paymentMethod,
        setPaymentMethod: setPaymentMethod,
        resetSelectedPaymentMethodData: resetSelectedPaymentMethodData,
    };
}
exports.default = usePaymentMethodState;
