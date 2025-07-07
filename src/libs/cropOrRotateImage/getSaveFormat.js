"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_manipulator_1 = require("expo-image-manipulator");
var CONST_1 = require("@src/CONST");
function getSaveFormat(type) {
    switch (type) {
        case CONST_1.default.IMAGE_FILE_FORMAT.PNG:
            return expo_image_manipulator_1.SaveFormat.PNG;
        case CONST_1.default.IMAGE_FILE_FORMAT.WEBP:
            return expo_image_manipulator_1.SaveFormat.WEBP;
        case CONST_1.default.IMAGE_FILE_FORMAT.JPEG:
            return expo_image_manipulator_1.SaveFormat.JPEG;
        default:
            return expo_image_manipulator_1.SaveFormat.JPEG;
    }
}
exports.default = getSaveFormat;
