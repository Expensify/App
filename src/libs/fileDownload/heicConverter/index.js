"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var heic_to_1 = require("heic-to");
/**
 * Web implementation for converting HEIC/HEIF images to JPEG
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
    fetch(file.uri)
        .then(function (response) { return response.blob(); })
        .then(function (blob) {
        var _a;
        var fileFromBlob = new File([blob], (_a = file.name) !== null && _a !== void 0 ? _a : 'temp-file', {
            type: blob.type,
        });
        return (0, heic_to_1.isHeic)(fileFromBlob).then(function (isHEIC) {
            if (isHEIC || needsConversion) {
                return (0, heic_to_1.heicTo)({
                    blob: blob,
                    type: 'image/jpeg',
                })
                    .then(function (convertedBlob) {
                    var fileName = file.name ? file.name.replace(/\.(heic|heif)$/i, '.jpg') : 'converted-image.jpg';
                    var jpegFile = new File([convertedBlob], fileName, { type: 'image/jpeg' });
                    jpegFile.uri = URL.createObjectURL(jpegFile);
                    onSuccess(jpegFile);
                })
                    .catch(function (err) {
                    console.error('Error converting image format to JPEG:', err);
                    onError(err, file);
                })
                    .finally(function () {
                    onFinish();
                });
            }
            onSuccess(file);
            onFinish();
        });
    })
        .catch(function (err) {
        console.error('Error processing the file:', err);
        onError(err, file);
        onFinish();
    });
};
exports.default = convertHeicImage;
