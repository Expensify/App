/**
 * The react native document picker already works for iOS/Android, so just export the imported document picker
 */
import RNImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';

const AttachmentPicker = {};

/**
 * See https://github.com/react-native-community/react-native-image-picker/blob/master/docs/Reference.md#options
 * for option definitions
 */
const ImagePickerOptions = {
    customButtons: [{name: 'Document', title: 'Choose Document'}],
    storageOptions: {
        skipBackup: true,
    },
}

AttachmentPicker.showPicker = function (callback) {
    // TODO: Make into a promise?

    // We display the ImagePicker first, as the custom document choice is displayed as a custom ImagePicker option.
    RNImagePicker.showImagePicker(ImagePickerOptions, (response) => {
        if (response.customButton) {
            this.showDocumentPicker();
        } else {
            console.debug('Falling back to callback: ', response.customButton); // TODO: remove this log
            callback(response);
        }
    });
};

AttachmentPicker.showDocumentPicker = async function () {
    console.debug('Launch DocumentPicker');

    try {
        const results = await DocumentPicker.pick({
            type: [DocumentPicker.types.allFiles],
        });
        console.debug('Attachment selected: ' + results.uri, results.type, results.name, results.size);
    } catch (error) {
        if (DocumentPicker.isCancel(error)) {
            console.debug('User cancelled document selection');
        } else {
            throw error;
        }
    }
};

/*
 * The data returned from `showPicker` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
AttachmentPicker.getDataForUpload = fileData => ({
    name: fileData.fileName || 'chat_attachment',
    type: fileData.type,
    uri: fileData.uri,
});
export default AttachmentPicker;
