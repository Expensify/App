"use strict";
exports.__esModule = true;
var expo_image_manipulator_1 = require("expo-image-manipulator");
function getImageManipulator(_a) {
    var fileUri = _a.fileUri, width = _a.width, height = _a.height, fileName = _a.fileName;
    return expo_image_manipulator_1.manipulateAsync(fileUri !== null && fileUri !== void 0 ? fileUri : '', [{ resize: { width: width, height: height } }]).then(function (result) {
        return fetch(result.uri)
            .then(function (res) { return res.blob(); })
            .then(function (blob) {
            var resizedFile = new File([blob], fileName + ".jpeg", { type: 'image/jpeg' });
            resizedFile.uri = URL.createObjectURL(resizedFile);
            return resizedFile;
        });
    });
}
exports["default"] = getImageManipulator;
