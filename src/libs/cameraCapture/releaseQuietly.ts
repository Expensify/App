import Log from '@libs/Log';

/** The garbage collector can't see the native memory a 12 MP bitmap holds, so free it as soon as the photo is saved. */
function releaseQuietly(releasable: {release: () => void}) {
    try {
        releasable.release();
    } catch (error) {
        Log.warn('[cameraCapture] could not release a native image', {error: error instanceof Error ? error.message : String(error)});
    }
}

export default releaseQuietly;
