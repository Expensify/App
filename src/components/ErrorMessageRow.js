"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mapValues_1 = require("lodash/mapValues");
var react_1 = require("react");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var MessagesRow_1 = require("./MessagesRow");
function ErrorMessageRow(_a) {
    var errors = _a.errors, errorRowStyles = _a.errorRowStyles, onClose = _a.onClose, _b = _a.canDismissError, canDismissError = _b === void 0 ? true : _b, dismissError = _a.dismissError;
    // Some errors have a null message. This is used to apply opacity only and to avoid showing redundant messages.
    var errorEntries = Object.entries(errors !== null && errors !== void 0 ? errors : {});
    var filteredErrorEntries = errorEntries.filter(function (errorEntry) { return errorEntry[1] !== null; });
    var errorMessages = (0, mapValues_1.default)(Object.fromEntries(filteredErrorEntries), function (error) { return error; });
    var hasErrorMessages = !(0, EmptyObject_1.isEmptyObject)(errorMessages);
    return hasErrorMessages ? (<MessagesRow_1.default messages={errorMessages} type="error" onClose={onClose} containerStyles={errorRowStyles} canDismiss={canDismissError} dismissError={dismissError}/>) : null;
}
ErrorMessageRow.displayName = 'ErrorMessageRow';
exports.default = ErrorMessageRow;
