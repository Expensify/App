/**
 * Native keeps the picked File as-is: there is no IndexedDB blob path to poison, and the
 * File polyfill has no arrayBuffer. Only rename (or retype) when the cleaned name or the type differs.
 */
function snapshotPickedFile(file: File, name: string, type = file.type): Promise<File> {
    if (file.name !== name || file.type !== type) {
        return Promise.resolve(new File([file], name, {type}));
    }
    return Promise.resolve(file);
}

export default snapshotPickedFile;
