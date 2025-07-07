"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReady = exports.isClientTheLeader = exports.init = void 0;
var init = function () { };
exports.init = init;
var isClientTheLeader = function () { return true; };
exports.isClientTheLeader = isClientTheLeader;
var isReady = function () { return Promise.resolve(); };
exports.isReady = isReady;
