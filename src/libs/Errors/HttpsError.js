"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom error class useful for re-throwing fetch errors with status code or valid error responses with status 200 but non 200 jsonCode
 */
var HttpsError = /** @class */ (function (_super) {
    __extends(HttpsError, _super);
    function HttpsError(_a) {
        var message = _a.message, _b = _a.status, status = _b === void 0 ? '' : _b, _c = _a.title, title = _c === void 0 ? '' : _c;
        var _this = _super.call(this, message) || this;
        _this.name = 'HttpsError';
        _this.status = status;
        _this.title = title;
        return _this;
    }
    return HttpsError;
}(Error));
exports.default = HttpsError;
