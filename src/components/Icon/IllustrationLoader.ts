import type IconAsset from '@src/types/utils/IconAsset';
import type {IllustrationName} from './chunks/illustrations.chunk';

type IllustrationsChunk = {
    getIllustration: (illustrationName: IllustrationName) => IconAsset | undefined;
    AVAILABLE_ILLUSTRATIONS: IllustrationName[];
} & Record<string, IconAsset>;

let illustrationsChunk: IllustrationsChunk | null = null;
let chunkLoadingPromise: Promise<IllustrationsChunk> | null = null;

/**
 * Load the illustrations chunk eagerly
 */
function loadIllustrationsChunk(): Promise<IllustrationsChunk> {
    if (illustrationsChunk) {
        return Promise.resolve(illustrationsChunk);
    }

    if (chunkLoadingPromise) {
        return chunkLoadingPromise;
    }

    chunkLoadingPromise = import(
        /* webpackChunkName: "illustrations" */
        /* webpackPreload: true */
        './chunks/illustrations.chunk'
    )
        .then((chunk) => {
            const typedChunk = chunk as unknown as IllustrationsChunk;
            illustrationsChunk = typedChunk;
            return typedChunk;
        })
        .catch((error) => {
            chunkLoadingPromise = null; // Reset on error to allow retry
            throw new Error(`Failed to load Illustrations chunk: ${String(error)}`);
        });

    return chunkLoadingPromise;
}

/**
 * Get an Illustration by name from the eagerly loaded chunk
 * This function provides immediate access once the chunk is loaded
 */
function loadIllustration(illustrationName: IllustrationName): Promise<{default: IconAsset}> {
    return loadIllustrationsChunk()
        .then((chunk) => {
            const illustration = chunk.getIllustration(illustrationName);
            if (!illustration) {
                throw new Error(`Illustration "${illustrationName}" not found`);
            }
            return {default: illustration}; // Changed to return {default: illustration}
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`Failed to load Illustration: ${illustrationName}`, error);
            throw error;
        });
}

export {loadIllustration, loadIllustrationsChunk};

export type {IllustrationName};
