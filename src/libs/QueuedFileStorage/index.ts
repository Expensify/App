import type {DeleteFiles, GetFile, KeepOnly, QueuedFileRef, StoreFile} from './types';

import {isQueuedFileRef} from './types';

const DB_NAME = 'OnyxQueuedFiles';
const STORE_NAME = 'files';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | undefined;
let keyCounter = 0;

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function openDB(): Promise<IDBDatabase> {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            if (request.result.objectStoreNames.contains(STORE_NAME)) {
                return;
            }
            request.result.createObjectStore(STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    return dbPromise;
}

function generateKey(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    keyCounter += 1;
    return `qf-${keyCounter}-${Date.now()}`;
}

const storeFile: StoreFile = async (blob) => {
    const db = await openDB();
    const key = generateKey();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, key);
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
    return key;
};

const getFile: GetFile = async (key) => {
    const db = await openDB();
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    return new Promise<unknown>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const deleteFiles: DeleteFiles = async (keys) => {
    if (keys.length === 0) {
        return;
    }
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const key of keys) {
        store.delete(key);
    }
    await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
};

const keepOnly: KeepOnly = async (keysToKeep) => {
    const db = await openDB();
    const readTx = db.transaction(STORE_NAME, 'readonly');
    const allKeys = await promisifyRequest<IDBValidKey[]>(readTx.objectStore(STORE_NAME).getAllKeys());
    const keep = new Set(keysToKeep);
    const toDelete = allKeys.filter((k): k is string => typeof k === 'string' && !keep.has(k));
    await deleteFiles(toDelete);
};

export {storeFile, getFile, deleteFiles, keepOnly, isQueuedFileRef};
export type {QueuedFileRef};
