"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyUpdates = void 0;
var OnyxUpdates = require("@userActions/OnyxUpdates");
// This function applies a list of updates to Onyx in order and resolves when all updates have been applied
var applyUpdates = function (updates) { return Promise.all(Object.values(updates).map(function (update) { return OnyxUpdates.apply(update); })); };
exports.applyUpdates = applyUpdates;
