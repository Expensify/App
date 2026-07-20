import Log from '@libs/Log';

import type {DeleteFiles, GetFile, KeepOnly, QueuedFileRef, StoreFile} from './types';

import {isQueuedFileRef} from './types';

/**
 * Web backend for QueuedFileStorage: keeps a queued upload's bytes out of the Onyx request queue,
 * in Cache Storage. Cache Storage uses a different disk backend than the IndexedDB blob path that
 * fails with `DataError: Failed to write blobs`, and mirrors Attachment/index.ts.
 */
const isFileStorageSupported = true;

const CACHE_NAME = 'OnyxQueuedFiles';
// Same-origin synthetic path; a real origin avoids any Request-URL validation edge cases.
const KEY_PREFIX = '/__queued-file__/';

let keyCounter = 0;

function generateKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    keyCounter += 1;
    return `qf-${keyCounter}-${Date.now()}`;
}

/** The synthetic Request URL a queued-file key maps to inside the cache. */
function urlForKey(key: string): string {
    return `${KEY_PREFIX}${encodeURIComponent(key)}`;
}

/** Recover the queued-file key from a cached Request URL (the cache stores resolved absolute URLs). */
function keyForUrl(url: string): string | undefined {
    const {pathname} = new URL(url);
    if (!pathname.startsWith(KEY_PREFIX)) {
        return undefined;
    }
    return decodeURIComponent(pathname.slice(KEY_PREFIX.length));
}

const storeFile: StoreFile = async (blob) => {
    const key = generateKey();
    try {
        const cache = await caches.open(CACHE_NAME);
        // Preserve MIME type on the Response so getFile() returns a correctly typed Blob.
        const headers = new Headers();
        if (blob.type) {
            headers.set('Content-Type', blob.type);
        }
        await cache.put(urlForKey(key), new Response(blob, {headers}));
    } catch (error) {
        // A store failure means an upload can't be queued; surface it so prod telemetry shows the rate.
        Log.alert('[QueuedFileStorage] Failed to store queued file in Cache Storage', {error});
        throw error;
    }
    return key;
};

const getFile: GetFile = async (key) => {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(urlForKey(key));
    if (!response) {
        return undefined;
    }
    return response.blob();
};

const deleteFiles: DeleteFiles = async (keys) => {
    if (keys.length === 0) {
        return;
    }
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(keys.map((key) => cache.delete(urlForKey(key))));
};

const keepOnly: KeepOnly = async (keysToKeep) => {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const keep = new Set(keysToKeep);
    await Promise.all(
        requests.map((request) => {
            const key = keyForUrl(request.url);
            if (key === undefined || keep.has(key)) {
                return Promise.resolve(false);
            }
            return cache.delete(request);
        }),
    );
};

export {storeFile, getFile, deleteFiles, keepOnly, isQueuedFileRef, isFileStorageSupported};
export type {QueuedFileRef};
