"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// This context is meant to inform modal children that they are rendering in a modal (and what type of modal they are rendering in)
// Note that this is different than ONYXKEYS.MODAL.isVisible data point in that that is a global variable for whether a modal is visible or not,
// whereas this context is provided by the BaseModal component, and thus is only available to components rendered inside a modal.
var ModalContext = (0, react_1.createContext)({ default: true });
exports.default = ModalContext;
