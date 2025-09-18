import PlaceholderIcon from '@components/Icon/PlaceholderIcon';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

type LazyAssetResult<T> = {
    asset: T;
    isLoaded?: boolean;
    isLoading?: boolean;
    hasError?: boolean;
};

/**
 * Hook for lazy loading any type of asset
 */
function useLazyAsset<T>(importFn: () => Promise<{default: T}>, fallback?: T): LazyAssetResult<T> {
    const assetRef = useRef<T>(PlaceholderIcon as T);
    const versionRef = useRef(0);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const memoizedImportFn = useMemo(() => importFn, [importFn]);

    useEffect(() => {
        let isMounted = true;
        const currentVersion = ++versionRef.current;

        const loadAsset = () => {
            setIsLoading(true);
            setHasError(false);

            memoizedImportFn()
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
        };

        loadAsset();

        return () => {
            isMounted = false;
        };
    }, [memoizedImportFn, fallback]);

    return {
        asset: isLoaded ? assetRef?.current : PlaceholderIcon as T,
        isLoaded,
        isLoading,
        hasError,
    } as const;
}

/**
 * Hook that automatically memoizes the import function
 * This prevents the need for callers to manually use useCallback
 */
function useMemoizedLazyAsset<T>(importFn: () => Promise<{default: T}>, fallback?: T): LazyAssetResult<T> {
    const stableImportFn = useCallback(() => importFn(), [importFn]);
    return useLazyAsset(stableImportFn, fallback);
}

export {useMemoizedLazyAsset, type LazyAssetResult};
export default useLazyAsset;
