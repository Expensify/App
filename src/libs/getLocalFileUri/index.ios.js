/**
 * Returns the decoded URI String. iOS expects file names without encoding
 * @return {String}
 */

export default localFileUri => decodeURIComponent(localFileUri);
