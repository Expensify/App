/** iOS prompts for photo permission itself on the first write, so there is no upfront gate. */
function hasGalleryWritePermission(): Promise<boolean> {
    return Promise.resolve(true);
}

export default hasGalleryWritePermission;
