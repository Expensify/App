"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONFIG_1 = require("@src/CONFIG");
/**
 * Is capturing performance stats enabled.
 */
var canCapturePerformanceMetrics = function () { return CONFIG_1.default.CAPTURE_METRICS; };
exports.default = canCapturePerformanceMetrics;
