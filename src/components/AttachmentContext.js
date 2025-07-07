"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentContext = void 0;
var react_1 = require("react");
var AttachmentContext = (0, react_1.createContext)({
    type: undefined,
    reportID: undefined,
    accountID: undefined,
    hashKey: undefined,
});
exports.AttachmentContext = AttachmentContext;
AttachmentContext.displayName = 'AttachmentContext';
