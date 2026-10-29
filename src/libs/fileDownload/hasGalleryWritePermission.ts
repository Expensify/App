/** Type-resolution base; never called on web (no device gallery). */
function hasGalleryWritePermission(): Promise<boolean> {
    return Promise.resolve(false);
}

export default hasGalleryWritePermission;
