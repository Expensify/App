// Implementation adapted from https://github.com/QuantumBA/foqum-react-native-document-picker/blob/master/web/index.js

const ImagePicker = {
    showImagePicker(options, callback) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = function () {
            const file = input.files[0];
            file.uri = URL.createObjectURL(file);

            callback(file);
        };

        input.click();
    },

    /**
     *
     * The data returned from `showImagePicker` is different on web and mobile, so use this function to ensure the
     * data we send to the xhr will be handled properly by the API. On web, we just want to send the file data returned
     * from the input.
     *
     * @param {object} fileData
     * @returns {object}
     */
    getDataForUpload(fileData) {
        return fileData;
    },
};

export default ImagePicker;
