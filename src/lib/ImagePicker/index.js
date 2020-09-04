/**
 * Trick for getting file selector cancel using `body.onfocus` event found at
 * http://trishulgoel.com/handle-cancel-click-on-file-input/
 */

const {body} = document;
const input = document.createElement('input');
input.type = 'file';

const ImagePicker = {
    showImagePicker(callback) {
        const {files} = input;
        if (files) {
            Array.prototype.forEach.call(files, this.removeUri);
        }

        this.showImagePickerWrapper()
            .then((result) => {
                callback(result);
            })
            .catch((result) => {
                callback(result);
            });
    },

    showImagePickerWrapper() {
        const self = this;
        const promise = new Promise((resolve, reject) => {
            function onfocus() {
                body.removeEventListener('focus', onfocus, true);

                setTimeout(() => {
                    const {files} = input;
                    if (!files.length) {
                        // eslint-disable-next-line prefer-promise-reject-errors
                        return reject({
                            didCancel: true
                        });
                    }

                    self.addUri(files[0]);
                    resolve({
                        uri: files[0].uri
                    });
                }, 500);
            }

            body.addEventListener('focus', onfocus, true);
        });

        input.click();

        return promise;
    },

    addUri(file) {
        const newFile = file;
        newFile.uri = URL.createObjectURL(file);

        return newFile;
    },

    removeUri(file) {
        URL.revokeObjectURL(file.uri);

        delete file.uri;
    },
};

export default ImagePicker;
