"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
exports.default = (0, react_1.createContext)({
    registerInput: function () {
        throw new Error('Registered input should be wrapped with FormWrapper');
    },
});
