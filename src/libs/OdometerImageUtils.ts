import type {FileObject} from '@src/types/utils/Attachment';

function getOdometerImageUri(image: FileObject | string | null | undefined): string | undefined {
    return typeof image === 'string' ? image : image?.uri;
}

/**
 * Revokes a blob URL previously associated with an odometer image, but only when
 * the image has actually changed (i.e. the old URL differs from the new one).
 *
 * Skips revocation when:
 *  - The `URL` API is not available (non-browser environments / native)
 *  - The URI is not a blob: URL (e.g. file:// on native, https:// for uploaded images)
 *  - The old and new URIs are identical (image was not replaced)
 */
function revokeOdometerImageUri(image: FileObject | string | null | undefined, nextImage?: FileObject | string | null): void {
    if (typeof URL === 'undefined') {
        return;
    }

    const currentUri = getOdometerImageUri(image);
    if (!currentUri?.startsWith('blob:')) {
        return;
    }
    const nextUri = getOdometerImageUri(nextImage);
    if (currentUri === nextUri) {
        return;
    }
    URL.revokeObjectURL(currentUri);
}

export {getOdometerImageUri};
export default revokeOdometerImageUri;
