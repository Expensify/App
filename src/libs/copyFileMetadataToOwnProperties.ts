/**
 * A React Native File keeps its name and type on its prototype, but storing a request as JSON and building a native
 * multipart part both read only the object's own properties. Without this copy, the file comes back unnamed and untyped.
 */
function copyFileMetadataToOwnProperties(file: Blob) {
    Object.defineProperties(file, {
        ...('name' in file && typeof file.name === 'string' && {name: {value: file.name, enumerable: true}}),
        type: {value: file.type, enumerable: true},
    });
}

export default copyFileMetadataToOwnProperties;
