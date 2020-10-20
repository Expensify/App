/**
 * The react native document picker already works for iOS/Android, so just export the imported document picker
 */
import RNImagePicker from 'react-native-image-picker';

const ImagePicker = RNImagePicker;

/*
 * The data returned from `showImagePicker` is different on web and mobile, so use this function to ensure the data we
 * send to the xhr will be handled properly.
 */
ImagePicker.getDataForUpload = fileData => ({
    name: fileData.fileName || 'chat_attachment',
    type: fileData.type,
    uri: fileData.uri,
});
export default ImagePicker;
