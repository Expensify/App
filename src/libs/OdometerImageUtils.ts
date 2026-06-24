import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import {getMimeTypeFromUri} from './fileDownload/FileUtils';
import getPlatform from './getPlatform';

function getOdometerImageUri(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? image : (image?.uri ?? '');
}

function getOdometerImageName(image: FileObject | string | null | undefined): string {
    return typeof image === 'string' ? (image.split('/').pop() ?? '') : (image?.name ?? '');
}

/**
 * A re-mint-invariant identity for an odometer image, used in the discard-changes baseline diff.
 * `name|size|lastModified` is preserved across the draft round-trip, so it stays stable on resume/reload while still
 * changing for a real swap (`lastModified` disambiguates a different file that happens to share name + size).
 * When `lastModified` is missing we fall back to the uri ONLY on native, where the `file://` uri is durable, unique per
 * selection (rand64 suffix), and stable across the round-trip (no blob re-mint) - so a same-name/same-size swap stays
 * detectable. On web the uri is a volatile `blob:` that re-mints on every resume/reload, so including it would fire a
 * false discard prompt; there we use `name|size` alone.
 */
function getOdometerImageIdentity(image: FileObject | string | null | undefined): string {
    if (!image) {
        return '';
    }
    if (typeof image === 'string') {
        return image;
    }
    const base = `${image.name ?? ''}|${image.size ?? ''}`;
    if (image.lastModified !== undefined) {
        return `${base}|${image.lastModified}`;
    }
    // No lastModified: only native's durable file:// uri is a safe disambiguator. On web the uri is a volatile blob:
    // that re-mints on resume/reload, so name|size alone keeps the identity stable and avoids a false discard prompt.
    return getPlatform() === CONST.PLATFORM.WEB ? base : `${base}|${image.uri ?? ''}`;
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
