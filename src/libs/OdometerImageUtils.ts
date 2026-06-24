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
 * On web, `uri` changes on every re-mint, but `name|size|lastModified` is preserved across the draft round-trip, so it
 * stays stable on resume/reload while still changing for a real swap (`lastModified` disambiguates a different
 * file that happens to share name + size). Native image objects have no `lastModified`, but their durable `file://`
 * uri is unique per selection (rand64 suffix) and stable across the draft round-trip (no blob re-mint on native), so
 * we fall back to it there to keep a same-name/same-size swap detectable.
 */
function getOdometerImageIdentity(image: FileObject | string | null | undefined): string {
    if (!image) {
        return '';
    }
    if (typeof image === 'string') {
        return image;
    }
    const base = `${image.name ?? ''}|${image.size ?? ''}`;
    return image.lastModified !== undefined ? `${base}|${image.lastModified}` : `${base}|${image.uri ?? ''}`;
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
