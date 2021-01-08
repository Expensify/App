/**
 * getFileExtensionFromURL gets sourceURL of file as only parameter and returns file extension
 */

/**
 * @param {String} sourceURL
 */

const getFileExtensionFromURL = (sourceURL) => {
    if (!sourceURL) { return null; }

    // get file extension from sourceURL
    const extension = sourceURL.split(/[#?]/)[0].split('.').pop().trim();
    if (!extension) { return null; }
    return extension;
};

export default getFileExtensionFromURL;
