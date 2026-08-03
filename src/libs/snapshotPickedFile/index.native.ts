/**
 * Native keeps the picked File as-is: there is no IndexedDB blob path to poison, and the
 * File polyfill has no arrayBuffer. Only rename when the cleaned name differs.
 */
function snapshotPickedFile(file: File, name: string): Promise<File> {
    if (file.name !== name) {
        return Promise.resolve(new File([file], name, {type: file.type}));
    }
    return Promise.resolve(file);
}

export default snapshotPickedFile;
