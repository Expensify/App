import CONST from '@src/CONST';

/**
 * Returns true if the given error is a webpack ChunkLoadError — the error thrown when a
 * dynamically-imported script cannot be fetched (e.g. after a deploy removes old chunk hashes).
 */
function isChunkLoadError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.name === CONST.CHUNK_LOAD_ERROR || /Loading chunk \S+ failed/i.test(error.message);
}

export default isChunkLoadError;
