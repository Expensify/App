/**
 * Returns the decoded URI String. React-native-document-picker returns encoded file path on iOS.
 * @param {String} localFileUri
 * @returns {String}
 */

export default localFileUri => decodeURIComponent(localFileUri);
