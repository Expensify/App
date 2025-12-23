import type IconAsset from '@src/types/utils/IconAsset';
import type ExpensifyIcons from './chunks/expensify-icons.chunk';

type ExpensifyIconsChunk = {
    getExpensifyIcon: (iconName: ExpensifyIconName) => IconAsset | undefined;
    AVAILABLE_EXPENSIFY_ICONS: ExpensifyIconName[];
} & Record<string, IconAsset>;

type ExpensifyIconName = keyof typeof ExpensifyIcons;

let expensifyIconsChunk: ExpensifyIconsChunk | null = null;
let chunkLoadingPromise: Promise<ExpensifyIconsChunk> | null = null;

/**
 * Load the ExpensifyIcons chunk eagerly
 */
function loadExpensifyIconsChunk(): Promise<ExpensifyIconsChunk> {
    if (expensifyIconsChunk) {
        return Promise.resolve(expensifyIconsChunk);
    }

    if (chunkLoadingPromise) {
        return chunkLoadingPromise;
    }

    chunkLoadingPromise = import(
        /* webpackChunkName: "expensifyIcons" */
        /* webpackPreload: true */
        './chunks/expensify-icons.chunk'
    )
        .then((chunk) => {
            const typedChunk = chunk as unknown as ExpensifyIconsChunk;
            expensifyIconsChunk = typedChunk;
            return typedChunk;
        })
        .catch((error) => {
            chunkLoadingPromise = null; // Reset on error to allow retry
            throw new Error(`Failed to load ExpensifyIcons chunk: ${String(error)}`);
        });

    return chunkLoadingPromise;
}

/**
 * Get an ExpensifyIcon by name from the eagerly loaded chunk
 * This function provides immediate access once the chunk is loaded
 */
function loadExpensifyIcon(iconName: ExpensifyIconName): {default: IconAsset} | Promise<{default: IconAsset}> {
    const cachedChunk = getExpensifyIconsChunk();
    if (cachedChunk) {
        const icon = cachedChunk.getExpensifyIcon(iconName);
        if (!icon) {
            return Promise.reject(new Error(`ExpensifyIcon "${iconName}" not found`));
        }
        return {default: icon};
    }

    // Fallback to async loading if chunk not cached
    return loadExpensifyIconsChunk()
        .then((chunk) => {
            const icon = chunk.getExpensifyIcon(iconName);
            if (!icon) {
                throw new Error(`ExpensifyIcon "${iconName}" not found`);
            }
            return {default: icon};
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`Failed to load ExpensifyIcon: ${iconName}`, error);
            throw error;
        });
}

/**
 * Get the cached ExpensifyIcons chunk synchronously
 * Returns null if the chunk hasn't been loaded yet
 * Use this to avoid Promise microtask delay when chunk is already loaded
 */
function getExpensifyIconsChunk(): ExpensifyIconsChunk | null {
    return expensifyIconsChunk;
}

export {loadExpensifyIcon, loadExpensifyIconsChunk, getExpensifyIconsChunk};

export type {ExpensifyIconName, ExpensifyIconsChunk};
