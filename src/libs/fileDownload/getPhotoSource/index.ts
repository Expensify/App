/** VisionCamera v5 returns plain paths on both platforms, where v4 returned a `file://` URL on iOS. */
function getPhotoSource(filePath: string): string {
    return filePath.startsWith('file://') ? filePath : `file://${filePath}`;
}

export default getPhotoSource;
