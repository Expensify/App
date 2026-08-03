import {isMobile} from '@libs/Browser';

// iPadOS Safari in "Request Desktop Website" mode (the default) reports a Macintosh user agent that
// isMobile() can't recognize; real Macs report zero touch points.
function isIPadInDesktopMode(): boolean {
    return /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
}

/**
 * Copies a picked file's bytes into a memory-backed File. A picked File only references its OS
 * file, so if that file is modified or deleted before the queued request is persisted, the
 * IndexedDB write fails with "Failed to write blobs" and poisons the persisted request queue.
 * Rejects when the backing file is already unreadable.
 */
async function snapshotPickedFile(file: File, name: string): Promise<File> {
    // Mobile browsers hand over sandboxed temp copies the OS won't touch after picking, and copying
    // every file's bytes would multiply peak memory by batch size on memory-constrained mobile
    // Safari — keep the lazy File there and only clean the name.
    if (isMobile() || isIPadInDesktopMode()) {
        if (file.name !== name) {
            return new File([file], name, {type: file.type});
        }
        return file;
    }
    return new File([await file.arrayBuffer()], name, {type: file.type, lastModified: file.lastModified});
}

export default snapshotPickedFile;
