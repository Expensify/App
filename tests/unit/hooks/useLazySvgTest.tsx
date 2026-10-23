import {act, renderHook} from '@testing-library/react-native';

import useLazySvg, {loadLazySvg} from '@hooks/useLazySvg';
import type {LazySvgLoader} from '@hooks/useLazySvg';

import React from 'react';

function FakeSvg() {
    return null;
}

// Each test creates its own loader because the hook caches resolved components by loader identity.
function createLoader(implementation: () => Promise<{default: unknown}>): jest.MockedFunction<LazySvgLoader> {
    return jest.fn(implementation);
}

describe('useLazySvg', () => {
    it('returns undefined until the chunk resolves, then the component', async () => {
        // Given a loader whose import has not resolved yet
        let resolveImport: (module: {default: unknown}) => void = () => {};
        const loader = createLoader(
            () =>
                new Promise((resolve) => {
                    resolveImport = resolve;
                }),
        );

        // When the hook mounts
        const {result} = renderHook(() => useLazySvg(loader));

        // Then nothing is rendered yet, so the caller can show a same-size placeholder
        expect(result.current).toBeUndefined();

        // When the import resolves
        await act(async () => {
            resolveImport({default: FakeSvg});
        });

        // Then the loaded component is returned
        expect(result.current).toBe(FakeSvg);
    });

    it('returns the cached component on the very first render of a second mount', async () => {
        // Given an SVG that an earlier mount already loaded (e.g. an earlier list row)
        const loader = createLoader(() => Promise.resolve({default: FakeSvg}));
        const first = renderHook(() => useLazySvg(loader));
        await act(async () => {
            await Promise.resolve();
        });
        expect(first.result.current).toBe(FakeSvg);

        // When another consumer mounts
        const renders: unknown[] = [];
        renderHook(() => {
            const component = useLazySvg(loader);
            renders.push(component);
            return component;
        });

        // Then the component is already there on the first commit, with no blank frame, and the chunk was not requested again
        expect(renders.at(0)).toBe(FakeSvg);
        expect(loader).toHaveBeenCalledTimes(1);
    });

    it('shares one import between consumers that mount at the same time', async () => {
        // Given a loader that is still pending
        let resolveImport: (module: {default: unknown}) => void = () => {};
        const loader = createLoader(
            () =>
                new Promise((resolve) => {
                    resolveImport = resolve;
                }),
        );

        // When several consumers mount before it resolves
        const first = renderHook(() => useLazySvg(loader));
        const second = renderHook(() => useLazySvg(loader));
        const third = renderHook(() => useLazySvg(loader));

        // Then only one import is started
        expect(loader).toHaveBeenCalledTimes(1);

        // When it resolves
        await act(async () => {
            resolveImport({default: FakeSvg});
        });

        // Then every consumer gets the component
        expect(first.result.current).toBe(FakeSvg);
        expect(second.result.current).toBe(FakeSvg);
        expect(third.result.current).toBe(FakeSvg);
    });

    it('keeps rendering the placeholder when the import fails, and retries on a later mount', async () => {
        // Given a chunk that fails to load the first time and succeeds afterwards
        const loader = createLoader(() => Promise.reject(new Error('Loading chunk failed')));
        const first = renderHook(() => useLazySvg(loader));

        // When the import rejects
        await act(async () => {
            await Promise.resolve();
        });

        // Then the hook does not throw and still reports no component
        expect(first.result.current).toBeUndefined();
        expect(loader).toHaveBeenCalledTimes(1);

        // When the chunk becomes reachable again and another consumer mounts
        loader.mockImplementation(() => Promise.resolve({default: FakeSvg}));
        const second = renderHook(() => useLazySvg(loader));
        await act(async () => {
            await Promise.resolve();
        });

        // Then the failure was not cached forever: the import is retried and the component is returned
        expect(loader).toHaveBeenCalledTimes(2);
        expect(second.result.current).toBe(FakeSvg);
    });

    it('does not fail when the consumer unmounts before the import resolves', async () => {
        // Given a pending import
        let resolveImport: (module: {default: unknown}) => void = () => {};
        const loader = createLoader(
            () =>
                new Promise((resolve) => {
                    resolveImport = resolve;
                }),
        );
        const {unmount} = renderHook(() => useLazySvg(loader));

        // When the consumer unmounts and the import resolves afterwards
        unmount();
        await act(async () => {
            resolveImport({default: FakeSvg});
        });

        // Then the component is still cached for the next mount
        const {result} = renderHook(() => useLazySvg(loader));
        expect(result.current).toBe(FakeSvg);
    });

    it('switches to the new loader when it changes', async () => {
        // Given two loaders (e.g. light and dark theme) where only the first is loaded
        function OtherSvg() {
            return null;
        }
        const lightLoader = createLoader(() => Promise.resolve({default: FakeSvg}));
        let resolveDark: (module: {default: unknown}) => void = () => {};
        const darkLoader = createLoader(
            () =>
                new Promise((resolve) => {
                    resolveDark = resolve;
                }),
        );
        const {result, rerender} = renderHook(({loader}: {loader: LazySvgLoader}) => useLazySvg(loader), {initialProps: {loader: lightLoader as LazySvgLoader}});
        await act(async () => {
            await Promise.resolve();
        });
        expect(result.current).toBe(FakeSvg);

        // When the loader changes
        rerender({loader: darkLoader});

        // Then the previous SVG is not shown for the new one
        expect(result.current).toBeUndefined();

        // When the new chunk resolves
        await act(async () => {
            resolveDark({default: OtherSvg});
        });

        // Then the new component is returned
        expect(result.current).toBe(OtherSvg);
    });

    it('wraps assets that are pre-rendered elements into a component', async () => {
        // Given a module whose default export is a React element (the OXC transform can produce these)
        const element = <FakeSvg />;
        const loader = createLoader(() => Promise.resolve({default: element}));

        // When it is loaded
        const component = await loadLazySvg(loader);

        // Then a function component is returned, because ImageSVG expects a component
        expect(typeof component).toBe('function');
    });
});
