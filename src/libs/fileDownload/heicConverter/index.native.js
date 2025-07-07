"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expo_image_manipulator_1 = require("expo-image-manipulator");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
/**
 * Helper function to convert HEIC/HEIF image to JPEG using ImageManipulator
 * @param file - The original file object
 * @param sourceUri - URI of the image to convert
 * @param originalExtension - The original file extension pattern to replace
 * @param callbacks - Callback functions for the conversion process
 */
var convertImageWithManipulator = function (file, sourceUri, originalExtension, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.onSuccess, onSuccess = _c === void 0 ? function () { } : _c, _d = _b.onError, onError = _d === void 0 ? function () { } : _d, _e = _b.onFinish, onFinish = _e === void 0 ? function () { } : _e;
    expo_image_manipulator_1.ImageManipulator.manipulate(sourceUri)
        .renderAsync()
        .then(function (manipulatedImage) { return manipulatedImage.saveAsync({ format: expo_image_manipulator_1.SaveFormat.JPEG }); })
        .then(function (manipulationResult) {
        var _a, _b;
        var convertedFile = {
            uri: manipulationResult.uri,
            name: (_b = (_a = file.name) === null || _a === void 0 ? void 0 : _a.replace(originalExtension, '.jpg')) !== null && _b !== void 0 ? _b : 'converted-image.jpg',
            type: 'image/jpeg',
            size: file.size,
            width: manipulationResult.width,
            height: manipulationResult.height,
        };
        onSuccess(convertedFile);
    })
        .catch(function (err) {
        console.error('Error converting HEIC/HEIF to JPEG:', err);
        onError(err, file);
    })
        .finally(function () {
        onFinish();
    });
};
/**
 * Native implementation for converting HEIC/HEIF images to JPEG
 * @param file - The file to check and potentially convert
 * @param callbacks - Object containing callback functions for different stages of conversion
 */
var convertHeicImage = function (file, _a) {
    var _b, _c, _d;
    var _e = _a === void 0 ? {} : _a, _f = _e.onSuccess, onSuccess = _f === void 0 ? function () { } : _f, _g = _e.onError, onError = _g === void 0 ? function () { } : _g, _h = _e.onStart, onStart = _h === void 0 ? function () { } : _h, _j = _e.onFinish, onFinish = _j === void 0 ? function () { } : _j;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var needsConversion = ((_b = file.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().endsWith('.heic')) || ((_c = file.name) === null || _c === void 0 ? void 0 : _c.toLowerCase().endsWith('.heif'));
    if (!needsConversion || !file.uri || !((_d = file.type) === null || _d === void 0 ? void 0 : _d.startsWith('image'))) {
        onSuccess(file);
        return;
    }
    onStart();
    if (!file.uri) {
        onError(new Error('File URI is undefined'), file);
        onFinish();
        return;
    }
    // Conversion based on extension
    if (needsConversion) {
        var fileUri = file.uri;
        convertImageWithManipulator(file, fileUri, /\.(heic|heif)$/i, {
            onSuccess: onSuccess,
            onError: onError,
            onFinish: onFinish,
        });
        return;
    }
    // If not detected by extension, check using file signatures
    (0, FileUtils_1.verifyFileFormat)({ fileUri: file.uri, formatSignatures: CONST_1.default.HEIC_SIGNATURES })
        .then(function (isHEIC) {
        if (isHEIC) {
            var fileUri = file.uri;
            if (!fileUri) {
                onError(new Error('File URI is undefined'), file);
                onFinish();
                return;
            }
            convertImageWithManipulator(file, fileUri, /\.heic$/i, {
                onSuccess: onSuccess,
                onError: onError,
                onFinish: onFinish,
            });
            return;
        }
        onSuccess(file);
    })
        .catch(function (err) {
        console.error('Error processing the file:', err);
        onError(err, file);
    })
        .finally(function () {
        onFinish();
    });
};
exports.default = convertHeicImage;
