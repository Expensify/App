import {Platform} from 'react-native';

let RNFS: {DocumentDirectoryPath: unknown; writeFile: (arg0: string, arg1: string, arg2: string) => unknown};
// since react-native-fs is not designed to work in a web environment
if (Platform.OS !== 'web') {
    RNFS = require('react-native-fs');
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const Base64 = {
    btoa: (input = '') => {
        const str = input;
        let output = '';

        for (
            let block = 0, charCode, i = 0, map = chars;
            // eslint-disable-next-line no-cond-assign, no-bitwise
            str.charAt(i | 0) || ((map = '='), i % 1);
            // eslint-disable-next-line no-bitwise
            output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
        ) {
            charCode = str.charCodeAt((i += 3 / 4));

            if (charCode > 0xff) {
                throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }

            // eslint-disable-next-line no-bitwise
            block = (block << 8) | charCode;
        }

        return output;
    },

    atob: (input = '') => {
        const str = input.replace(/=+$/, '');
        let output = '';

        // eslint-disable-next-line eqeqeq
        if (str.length % 4 == 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            let bc = 0, bs = 0, buffer, i = 0;
            // eslint-disable-next-line no-cond-assign
            (buffer = str.charAt(i++));
            // eslint-disable-next-line no-bitwise, no-cond-assign
            ~buffer &&
            // eslint-disable-next-line no-cond-assign
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
            // eslint-disable-next-line no-bitwise
            bc++ % 4)
                ? // eslint-disable-next-line no-bitwise
                  (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
                : 0
        ) {
            buffer = chars.indexOf(buffer);
        }

        return output;
    },
};

/**
 * Converts a base64 encoded image string to a File instance in native platforms.
 * Adds a `uri` property to the File instance for accessing the blob as a URI.
 *
 * @param base64 - The base64 encoded image string.
 * @param filename - Desired filename for the File instance.
 * @returns The File instance created from the base64 string with an additional `uri` property.
 *
 * @example
 * const base64Image = "data:image/png;base64,..."; // your base64 encoded image
 * const imageFile = base64ToFile(base64Image, "example.png");
 * console.log(imageFile.uri); // Blob URI
 */
// eslint-disable-next-line @lwc/lwc/no-async-await
async function base64ToFileNative(base64: string, filename: string): Promise<File> {
    // Decode the base64 string
    const byteString = Base64.atob(Base64.btoa(base64.split(',')[1]));

    // Get the mime type from the base64 string
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

    // Convert byte string to Uint8Array
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Create a blob from the Uint8Array
    const blob = new Blob([uint8Array], {type: mimeString});

    // Create a File instance from the Blob
    const file = new File([blob], filename, {type: mimeString, lastModified: Date.now()});

    const directory = RNFS.DocumentDirectoryPath;
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const localImagePath = `${directory}/${filename}`;
    // Add a uri property to the File instance for accessing the blob as a URI
    const fileUri = `file://${localImagePath}`;
    await RNFS.writeFile(fileUri, base64, 'base64');

    file.uri = fileUri;

    return file;
}

export default {base64ToFileNative};
