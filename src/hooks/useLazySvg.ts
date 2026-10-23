import type {ReactElement} from 'react';
import type {SvgProps} from 'react-native-svg';

import {cloneElement, isValidElement, useEffect, useState} from 'react';

type SvgComponent = (props: SvgProps) => ReactElement | null;

/** Dynamic import of a single `.svg` asset. Define it once at module level: the cache is keyed by the loader's identity. */
type LazySvgLoader = () => Promise<{default: unknown}>;

type LazySvgState = {
    loader: LazySvgLoader;
    component: SvgComponent | undefined;
};

/** Resolved components. Read synchronously by the hook so a later mount renders the SVG on its first frame. */
const loadedComponents = new Map<LazySvgLoader, SvgComponent>();

/** In-flight requests, so concurrent mounts share one import. Removed when settled, so a failed import can be retried by a later mount. */
const pendingLoads = new Map<LazySvgLoader, Promise<SvgComponent | undefined>>();

/**
 * OXC can cache SVG assets as pre-rendered elements instead of components (see wrapElementAsIcon in useLazyAsset).
 * ImageSVG expects a component, so wrap those.
 */
function isSvgComponent(asset: unknown): asset is SvgComponent {
    return typeof asset === 'function';
}

function toSvgComponent(asset: unknown): SvgComponent | undefined {
    if (isValidElement<SvgProps>(asset)) {
        return (props: SvgProps) => cloneElement(asset, props);
    }
    return isSvgComponent(asset) ? asset : undefined;
}

function loadLazySvg(loader: LazySvgLoader): Promise<SvgComponent | undefined> {
    const loaded = loadedComponents.get(loader);
    if (loaded) {
        return Promise.resolve(loaded);
    }

    const pending = pendingLoads.get(loader);
    if (pending) {
        return pending;
    }

    const load = loader()
        .then((module) => {
            const component = toSvgComponent(module.default);
            if (component) {
                loadedComponents.set(loader, component);
            }
            return component;
        })
        .catch(() => {
            // The SVG is decorative, so a failed chunk is not worth surfacing; the caller keeps rendering the placeholder.
            return undefined;
        })
        .finally(() => {
            pendingLoads.delete(loader);
        });
    pendingLoads.set(loader, load);
    return load;
}

/**
 * Loads a decorative SVG on demand, keeping it out of the main bundle.
 * Returns undefined until the chunk is loaded (or if it failed to load), and the component right away when it was already loaded by an earlier mount.
 */
function useLazySvg(loader: LazySvgLoader | undefined): SvgComponent | undefined {
    const [state, setState] = useState<LazySvgState | undefined>(() => (loader ? {loader, component: loadedComponents.get(loader)} : undefined));

    // The loader changed (e.g. theme switch), so re-seed from the cache instead of showing the previous SVG.
    if (state?.loader !== loader) {
        setState(loader ? {loader, component: loadedComponents.get(loader)} : undefined);
    }

    useEffect(() => {
        if (!loader) {
            return;
        }

        let isMounted = true;
        loadLazySvg(loader).then((component) => {
            if (!isMounted || !component) {
                return;
            }
            // Also covers a chunk that finished loading between the seeding render and this effect (concurrent rendering); a state that already has the component bails out.
            setState((prev) => (prev?.loader === loader && prev.component ? prev : {loader, component}));
        });

        return () => {
            isMounted = false;
        };
    }, [loader]);

    return state?.loader === loader ? state?.component : undefined;
}

export default useLazySvg;
export type {LazySvgLoader, SvgComponent};
export {loadLazySvg};
