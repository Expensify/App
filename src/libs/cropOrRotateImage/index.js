"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_manipulator_1 = require("expo-image-manipulator");
var getSaveFormat_1 = require("./getSaveFormat");
var cropOrRotateImage = function (uri, actions, options) {
    return new Promise(function (resolve) {
        var format = (0, getSaveFormat_1.default)(options.type);
        (0, expo_image_manipulator_1.manipulateAsync)(uri, actions, { compress: options.compress, format: format }).then(function (result) {
            fetch(result.uri)
                .then(function (res) { return res.blob(); })
                .then(function (blob) {
                var file = new File([blob], options.name || 'fileName.jpeg', { type: options.type || 'image/jpeg' });
                file.uri = URL.createObjectURL(file);
                resolve(file);
            });
        });
    });
};
exports.default = cropOrRotateImage;
