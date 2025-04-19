
exports.__esModule = true;
const expo_image_manipulator_1 = require('expo-image-manipulator');

function getImageManipulator(_a) {
    const fileUri = _a.fileUri;
        const width = _a.width;
        const height = _a.height;
        const fileName = _a.fileName;
    return expo_image_manipulator_1.manipulateAsync(fileUri !== null && fileUri !== void 0 ? fileUri : '', [{resize: {width, height}}]).then(function (result) {
        return fetch(result.uri)
            .then(function (res) {
                return res.blob();
            })
            .then(function (blob) {
                const resizedFile = new File([blob], `${fileName  }.jpeg`, {type: 'image/jpeg'});
                resizedFile.uri = URL.createObjectURL(resizedFile);
                return resizedFile;
            });
    });
}
exports['default'] = getImageManipulator;
