"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get image resolution
 * Image object is returned as a result of a user selecting image using the react-native-image-picker
 * Image already has width and height properties coming from library so we just need to return them on native
 * Opposite to web where we need to create a new Image object and get dimensions from it
 *
 */
var getImageResolution = function (file) { var _a, _b; return Promise.resolve({ width: (_a = file.width) !== null && _a !== void 0 ? _a : 0, height: (_b = file.height) !== null && _b !== void 0 ? _b : 0 }); };
exports.default = getImageResolution;
