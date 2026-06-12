import type {FileObject} from '@src/types/utils/Attachment';
import {getMimeTypeFromUri} from './fileDownload/FileUtils';

function getOdometerImageUri(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? image : (image?.uri ?? '');
}

function getOdometerImageName(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? (image.split('/').pop() ?? '') : (image?.name ?? '');
}

/**
 * A re-mint-invariant identity for an odometer image, used in the discard-changes baseline diff.
 *
 * A re-mint (base64 -> blob via `deserializeOdometerDraftImage` on resume/reload, or a blob revoke/recreate)
 * keeps the file `name` and `size` but produces a fresh blob `uri`. So comparing `name|size` stays stable
 * across a re-mint while a different file (different name and/or size) reads as a change. Native images are
 * `file://` uri strings that never re-mint, so the string itself is already a stable identity
 */
function getOdometerImageIdentity(image: FileObject | string | null | undefined): string {
    if (!image) {
        return '';
    }
    if (typeof image === 'string') {
        return image;
    }
    return `${image.name ?? ''}|${image.size ?? ''}`;
}

function getOdometerImageType(image: FileObject | string | null | undefined): string | undefined {
    return typeof image === 'string' ? getMimeTypeFromUri(image) : (image?.type ?? getMimeTypeFromUri(image?.uri ?? ''));
}

/**
 * Revokes a blob URL previously associated with an odometer image, but only when
 * the image has actually changed (i.e. the old URL differs from the new one)
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

export {getOdometerImageUri, getOdometerImageName, getOdometerImageType, getOdometerImageIdentity};
export default revokeOdometerImageUri;
