import type IconAsset from '@src/types/utils/IconAsset';

type ExpensifyIconsChunk = {
    getExpensifyIcon: (iconName: string) => unknown;
    AVAILABLE_EXPENSIFY_ICONS: string[];
} & Record<string, IconAsset>;

type ExpensifyIconName = string;

let expensifyIconsChunk: ExpensifyIconsChunk | null = null;
let chunkLoadingPromise: Promise<ExpensifyIconsChunk> | null = null;

/**
 * Load the ExpensifyIcons chunk eagerl
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
function loadExpensifyIcon(iconName: ExpensifyIconName): Promise<{default: IconAsset}> {
    return loadExpensifyIconsChunk()
    .then((chunk) => {
        const icon = chunk.getExpensifyIcon(iconName) as IconAsset;
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

export {
    loadExpensifyIcon,
};

export type {ExpensifyIconName};
