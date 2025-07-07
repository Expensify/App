"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Shows an alert modal with ok and cancel options. */
var alert = function (title, description, options) {
    var _a, _b;
    var result = window.confirm([title, description].filter(Boolean).join('\n'));
    if (result) {
        var confirmOption = options === null || options === void 0 ? void 0 : options.find(function (_a) {
            var style = _a.style;
            return style !== 'cancel';
        });
        (_a = confirmOption === null || confirmOption === void 0 ? void 0 : confirmOption.onPress) === null || _a === void 0 ? void 0 : _a.call(confirmOption);
    }
    else {
        var cancelOption = options === null || options === void 0 ? void 0 : options.find(function (_a) {
            var style = _a.style;
            return style === 'cancel';
        });
        (_b = cancelOption === null || cancelOption === void 0 ? void 0 : cancelOption.onPress) === null || _b === void 0 ? void 0 : _b.call(cancelOption);
    }
};
exports.default = alert;
