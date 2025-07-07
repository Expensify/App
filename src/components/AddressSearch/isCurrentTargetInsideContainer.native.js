"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The related target check is not required here because in native there is no race condition rendering like on the web
var isCurrentTargetInsideContainer = function () { return false; };
exports.default = isCurrentTargetInsideContainer;
