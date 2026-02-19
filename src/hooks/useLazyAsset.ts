import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getExpensifyIconsChunk, loadExpensifyIconsChunk} from '@components/Icon/ExpensifyIconLoader';
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import {getIllustrationsChunk, loadIllustrationsChunk} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import PlaceholderIcon from '@components/Icon/PlaceholderIcon';
import type IconAsset from '@src/types/utils/IconAsset';

type LazyAssetResult<T> = {
    asset: T | undefined;
    isLoaded?: boolean;
    isLoading?: boolean;
    hasError?: boolean;
};

/**
 * Hook for lazy loading any type of asset
 */
function useLazyAsset<T>(importFn: () => {default: T} | Promise<{default: T}>, fallback?: T): LazyAssetResult<T> {
    const assetRef = useRef<T | undefined>(undefined);
    const versionRef = useRef(0);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const currentVersion = ++versionRef.current;

        // Call importFn inside the effect to avoid calling it on every render
        const importFnResult = importFn();
        const isResultPromise = importFnResult instanceof Promise;

        // Handle synchronous imports
        if (!isResultPromise) {
            assetRef.current = importFnResult.default;
            setIsLoaded(true);
            setIsLoading(false);
            return;
        }

        importFnResult
            .then((module) => {
                // Check if this is still the latest request and component is mounted
                if (!isMounted || currentVersion !== versionRef.current) {
                    return;
                }
                assetRef.current = module.default;
                setIsLoaded(true);
                setIsLoading(false);
            })
            .catch(() => {
                // Check if this is still the latest request and component is mounted
                if (!isMounted || currentVersion !== versionRef.current) {
                    return;
                }
                setHasError(true);
                setIsLoading(false);

                // Use fallback if available
                if (fallback) {
                    assetRef.current = fallback;
                    setIsLoaded(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [importFn, fallback]);

    return {
        asset: isLoaded ? assetRef?.current : undefined,
        isLoaded,
        isLoading,
        hasError,
    } as const;
}

/**
 * Hook that automatically memoizes the import function
 * This prevents the need for callers to manually use useCallback
 * Returns guaranteed non-null assets for existing components compatibility
 * Supports both synchronous and async return values for optimal performance
 */
function useMemoizedLazyAsset<T extends IconAsset>(importFn: () => {default: T} | Promise<{default: T}>, fallback?: T): {asset: T} {
    const stableImportFn = useCallback(() => importFn(), [importFn]);
    const {asset, isLoaded} = useLazyAsset(stableImportFn, fallback);

    return {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        asset: (isLoaded ? asset : PlaceholderIcon) as T,
    };
}

/**
 * Hook for loading multiple illustrations at once
 * Loads the illustrations chunk once and returns an object keyed by illustration names
 * Uses synchronous access when chunk is cached to avoid flash
 * @param names - Array of illustration names
 * @returns Object with illustration names as keys and IconAsset as values
 */
function useMemoizedLazyIllustrations<const TName extends readonly IllustrationName[]>(names: TName): Record<TName[number], IconAsset> {
    const cachedChunk = getIllustrationsChunk();
    const namesKey = useMemo(() => names.join(','), [names]);
    const namesList = useMemo(() => namesKey.split(',') as Array<TName[number]>, [namesKey]);

    // Try to get cached chunk synchronously to avoid Promise microtask delay
    const [assets, setAssets] = useState<Record<string, IconAsset>>(() => {
        if (cachedChunk) {
            const loaded: Record<string, IconAsset> = {};
            for (const name of names) {
                loaded[name as string] = cachedChunk.getIllustration(name) ?? PlaceholderIcon;
            }
            return loaded;
        }
        return {};
    });

    useEffect(() => {
        // If already loaded synchronously, skip async load
        if (cachedChunk) {
            return;
        }

        let isMounted = true;

        loadIllustrationsChunk()
            .then((chunk) => {
                if (!isMounted) {
                    return;
                }

                const loaded: Record<string, IconAsset> = {};
                for (const name of namesList) {
                    loaded[name as string] = chunk.getIllustration(name) ?? PlaceholderIcon;
                }
                setAssets(loaded);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                const fallback: Record<string, IconAsset> = {};
                for (const name of namesList) {
                    fallback[name as string] = PlaceholderIcon;
                }
                setAssets(fallback);
            });

        return () => {
            isMounted = false;
        };
    }, [namesList, cachedChunk]);

    return useMemo(() => Object.fromEntries(namesList.map((name) => [name, assets[name as string] ?? PlaceholderIcon])) as Record<TName[number], IconAsset>, [assets, namesList]);
}

/**
 * Hook for loading multiple Expensify icons at once
 * Loads the Expensify icons chunk once and returns an object keyed by icon names
 * Uses synchronous access when chunk is cached to avoid flash
 * @param names - Array of Expensify icon names
 * @returns Object with icon names as keys and IconAsset as values
 */
function useMemoizedLazyExpensifyIcons<const TName extends readonly ExpensifyIconName[]>(names: TName): Record<TName[number], IconAsset> {
    const cachedChunk = getExpensifyIconsChunk();
    const namesKey = useMemo(() => names.join(','), [names]);
    const namesList = useMemo(() => namesKey.split(',') as Array<TName[number]>, [namesKey]);

    // Try to get cached chunk synchronously to avoid Promise microtask delay
    const [assets, setAssets] = useState<Record<string, IconAsset>>(() => {
        if (cachedChunk) {
            const loaded: Record<string, IconAsset> = {};
            for (const name of namesList) {
                loaded[name as string] = cachedChunk.getExpensifyIcon(name) ?? PlaceholderIcon;
            }
            return loaded;
        }
        return {};
    });

    useEffect(() => {
        if (cachedChunk) {
            return;
        }

        let isMounted = true;

        loadExpensifyIconsChunk()
            .then((chunk) => {
                if (!isMounted) {
                    return;
                }

                const loaded: Record<string, IconAsset> = {};
                for (const name of namesList) {
                    loaded[name as string] = chunk.getExpensifyIcon(name) ?? PlaceholderIcon;
                }
                setAssets(loaded);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                const fallback: Record<string, IconAsset> = {};
                for (const name of namesList) {
                    fallback[name as string] = PlaceholderIcon;
                }
                setAssets(fallback);
            });

        return () => {
            isMounted = false;
        };
    }, [namesList, cachedChunk]);

    return useMemo(() => Object.fromEntries(namesList.map((name) => [name, assets[name as string] ?? PlaceholderIcon])) as Record<TName[number], IconAsset>, [assets, namesList]);
}

export {useMemoizedLazyAsset, useMemoizedLazyIllustrations, useMemoizedLazyExpensifyIcons, type LazyAssetResult};
export default useLazyAsset;
