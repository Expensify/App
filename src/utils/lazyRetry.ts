import type {ComponentType, LazyExoticComponent} from 'react';

type ComponentImport = () => Promise<{default: LazyExoticComponent<ComponentType>}>;

/**
 * Attempts to lazily import a React component with a retry mechanism on failure.
 * If the initial import fails with a `ChunkLoadError`, the function will refresh the page once and retry the import.
 * If the import fails again after the refresh, the error is propagated.
 *
 * @param componentImport - A function that returns a promise resolving to a lazily imported React component.
 * @returns A promise that resolves to the imported component or rejects with an error after a retry attempt.
 */
const lazyRetry = function (componentImport: ComponentImport): Promise<{default: LazyExoticComponent<ComponentType>}> {
    return new Promise((resolve, reject) => {
        // Retrieve the retry status from sessionStorage, defaulting to 'false' if not set
        const hasRefreshed: unknown = JSON.parse(sessionStorage.getItem('retry-lazy-refreshed') ?? 'false');

        componentImport()
            .then((component) => {
                // Reset the retry status to 'false' on successful import
                sessionStorage.setItem('retry-lazy-refreshed', 'false'); // success so reset the refresh
                resolve(component);
            })
            .catch((error) => {
                if (!hasRefreshed) {
                    // Set the retry status to 'true' and refresh the page
                    sessionStorage.setItem('retry-lazy-refreshed', 'true');
                    window.location.reload(); // Refresh the page to retry the import
                } else {
                    // If the import fails again reject with the error to trigger default error handling
                    reject(error);
                }
            });
    });
};

export default lazyRetry;
