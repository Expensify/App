/** Type-resolution base for the native `.ios`/`.android` files; never called on web (downloads go through the browser path). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- base for the platform-split signature
function saveLocalFileToGallery(localPath: string, fileName?: string, mimeType?: string): Promise<void> {
    return Promise.reject(new Error('Saving to the gallery is not supported on web'));
}

export default saveLocalFileToGallery;
