import type IconAsset from '@src/types/utils/IconAsset';
import {CORE_ICONS} from '@components/Icon/CORE_ICONS';
import {setExpensiconsCache} from '@components/Icon/chunks/illustrationLoader';

const coreIconCache = new Map<string, IconAsset>();

let isCoreLoadingComplete = false;

const preloadCoreIcons = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Only load once
        if (isCoreLoadingComplete) {
            resolve();
            return;
        }

        // Load core icons as separate chunks (not bundled with main)
        Promise.all([
            import(/* webpackChunkName: "core-expensicons" */ '@components/Icon/chunks/core-expensicons.chunk'),
            import(/* webpackChunkName: "core-illustrations" */ '@components/Icon/chunks/core-illustrations.chunk')
        ]).then(([coreExpensiconsModule, coreIllustrationsModule]) => {
            const coreExpensicons = coreExpensiconsModule as Record<string, IconAsset>;
            const coreIllustrations = coreIllustrationsModule as Record<string, IconAsset>;
            
            // Set core Expensicons cache for immediate access
            setExpensiconsCache(coreExpensicons);
            
            // Cache core icons from both sources
            CORE_ICONS.forEach((iconName) => {
                // Try core Expensicons first
                if (coreExpensicons[iconName]) {
                    coreIconCache.set(iconName, coreExpensicons[iconName]);
                }
                // Then try core Illustrations
                else if (coreIllustrations[iconName]) {
                    coreIconCache.set(iconName, coreIllustrations[iconName]);
                }
            });

            isCoreLoadingComplete = true;
            
            // eslint-disable-next-line no-console
            console.log(`🎯 Core icons preloaded as separate chunks. Cached ${coreIconCache.size} core icons.`);
            // eslint-disable-next-line no-console
            console.log('📦 Core icons loaded:', Array.from(coreIconCache.keys()));
            // eslint-disable-next-line no-console
            console.log('🔍 Icon sources:', {
                coreExpensicons: Object.keys(coreExpensicons).length,
                coreIllustrations: Object.keys(coreIllustrations).length,
                cached: coreIconCache.size
            });
            
            resolve();
        }).catch((error) => {
            // eslint-disable-next-line no-console
            console.warn('Failed to preload core icons:', error);
            reject(error);
        });
    });
};

/**
 * Get an icon from the core cache
 * Returns the icon if available, undefined if not cached
 */
const getCoreIcon = (name: string): IconAsset | undefined => {
    return coreIconCache.get(name);
};

/**
 * Check if an icon is available in the core cache
 */
const isIconCoreLoaded = (name: string): boolean => {
    return coreIconCache.has(name);
};

/**
 * Get core loading status
 */
const getCoreLoadingStatus = () => {
    return {
        cacheSize: coreIconCache.size,
        cachedIcons: Array.from(coreIconCache.keys()),
        isCoreLoadingComplete,
    };
};

/**
 * Check if core loading is complete
 */
const isCoreLoadingFinished = (): boolean => {
    return isCoreLoadingComplete;
};

// Export all functions
export {
    preloadCoreIcons,
    getCoreIcon,
    isIconCoreLoaded,
    getCoreLoadingStatus,
    isCoreLoadingFinished,
};
