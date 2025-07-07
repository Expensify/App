"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the Bounding Rectangle for the passed native event's target.
 */
var getClickedTargetLocation = function (target) { return target.getBoundingClientRect(); };
exports.default = getClickedTargetLocation;
