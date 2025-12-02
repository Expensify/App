import RNFetchBlob from 'react-native-blob-util';
import CONST from '@src/CONST';

export default function fetchImage(source: string, authToken: string) {
    // Create a unique filename based on timestamp
    const timestamp = Date.now();
    const extension = source.split('.').pop()?.split('?')?.at(0) ?? 'jpg';
    const filename = `temp_image_${timestamp}.${extension}`;
    const path = `${RNFetchBlob.fs.dirs.CacheDir}/${filename}`;

    return RNFetchBlob.config({
        fileCache: true,
        path,
    })
        .fetch('GET', source, {
            [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: authToken,
        })
        .then((res) => {
            // Return the file URI with file:// prefix for expo-image-manipulator
            return `file://${res.path()}`;
        });
}
