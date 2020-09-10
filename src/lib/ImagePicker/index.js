// Implementation adapted from https://github.com/QuantumBA/foqum-react-native-document-picker/blob/master/web/index.js

import _ from 'underscore';

const {body} = document;
const input = document.createElement('input');
input.type = 'file';

/**
 * Sets the URI value on the file
 *
 * @param {object} file
 * @returns {object}
 */
function addUri(file) {
    const newFile = file;
    newFile.uri = URL.createObjectURL(file);

    return newFile;
}

const ImagePicker = {
    showImagePicker(options, callback) {
        const {files} = input;

        // Clear previously saved files
        if (files) {
            input.value = '';
        }

        function onfocus() {
            body.removeEventListener('focus', onfocus, true);

            _.delay(() => {
                const inputFiles = input.files;
                if (!inputFiles.length) {
                    callback({
                        didCancel: true
                    });
                    return;
                }

                callback(addUri(inputFiles[0]));
            });
        }

        body.addEventListener('focus', onfocus, true);
        input.click();
    }
};

export default ImagePicker;
