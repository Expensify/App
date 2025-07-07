"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getImageManipulator;
var expo_image_manipulator_1 = require("expo-image-manipulator");
function getImageManipulator(_a) {
    var fileUri = _a.fileUri, width = _a.width, height = _a.height, type = _a.type, fileName = _a.fileName;
    return (0, expo_image_manipulator_1.manipulateAsync)(fileUri !== null && fileUri !== void 0 ? fileUri : '', [{ resize: { width: width, height: height } }]).then(function (result) { return ({
        uri: result.uri,
        width: result.width,
        height: result.height,
        type: type,
        name: fileName,
    }); });
}
