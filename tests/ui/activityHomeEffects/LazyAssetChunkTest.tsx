/**
 * Cover/reveal contract of the lazy illustration and Expensify icon chunks once the Home tab sits under
 * `ScreenActivityWrapper`.
 *
 * `useMemoizedLazyIllustrations` and `useMemoizedLazyExpensifyIcons` read the cached chunk during render and start an
 * async load only when there is none. A cover tears the effect down while that load is still in flight, so the
 * resolution is dropped by the `isMounted` guard. The hook still re-renders while it is hidden, and by then the chunk
 * is cached, so the closure the reveal re-runs sees a cached chunk and has to fill the assets from it. Returning early
 * there leaves the quick action bar and the free trial illustrations on `PlaceholderIcon` for the rest of the session.
 *
 * The suite runs the hook without React Compiler memoization, which is what makes that closure reachable. Babel's
 * compiler caches the render-time `getIllustrationsChunk()` call in a memo slot with no dependencies, so under Jest
 * the value would be frozen at mount, while OXC compiles the web bundle separately and the repo already treats a
 * memoization difference between the two compilers as a real risk. The hook has to be correct with no memoization.
 */
import {screen} from '@testing-library/react-native';

import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';

import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

import type IconAsset from '@src/types/utils/IconAsset';

import React, {Profiler} from 'react';
import {View} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

/** Stands in for the illustration the chunk exposes, so a rendered testID tells the real asset from the placeholder. */
function LoadedIllustration() {
    return <View testID="illustration-loaded" />;
}

/** Stands in for the Expensify icon the chunk exposes. */
function LoadedExpensifyIcon() {
    return <View testID="expensify-icon-loaded" />;
}

const ILLUSTRATION_NAME: IllustrationName = 'Abracadabra';
const EXPENSIFY_ICON_NAME: ExpensifyIconName = 'Bolt';

/**
 * Mirrors a chunk loader module: one shared load promise, and a chunk that is cached only once the test resolves that
 * promise, which is what lets a load stay in flight across a cover.
 */
function createChunkController<TChunk>(chunk: TChunk) {
    let cachedChunk: TChunk | null = null;
    let pendingLoad: Promise<TChunk> | undefined;
    let resolvePendingLoad: ((loadedChunk: TChunk) => void) | undefined;

    return {
        getCachedChunk: () => cachedChunk,
        load: () => {
            if (cachedChunk) {
                return Promise.resolve(cachedChunk);
            }

            pendingLoad ??= new Promise<TChunk>((resolveLoad) => {
                resolvePendingLoad = resolveLoad;
            });
            return pendingLoad;
        },
        resolveLoad: async () => {
            cachedChunk = chunk;
            resolvePendingLoad?.(chunk);
            await waitForBatchedUpdatesWithAct();
        },
        warmCache: () => {
            cachedChunk = chunk;
        },
        reset: () => {
            cachedChunk = null;
            pendingLoad = undefined;
            resolvePendingLoad = undefined;
        },
    };
}

const mockIllustrations = createChunkController({
    getIllustration: (name: string): IconAsset | undefined => (name === ILLUSTRATION_NAME ? LoadedIllustration : undefined),
});

const mockExpensifyIcons = createChunkController({
    getExpensifyIcon: (name: string): IconAsset | undefined => (name === EXPENSIFY_ICON_NAME ? LoadedExpensifyIcon : undefined),
});

jest.mock('@components/Icon/IllustrationLoader', () => ({
    getIllustrationsChunk: () => mockIllustrations.getCachedChunk(),
    loadIllustrationsChunk: () => mockIllustrations.load(),
}));

jest.mock('@components/Icon/ExpensifyIconLoader', () => ({
    getExpensifyIconsChunk: () => mockExpensifyIcons.getCachedChunk(),
    loadExpensifyIconsChunk: () => mockExpensifyIcons.load(),
}));

// A fresh cache on every render makes every React Compiler memo slot miss, which runs the hook as its source reads.
jest.mock('react/compiler-runtime', () => ({
    c: (size: number) => new Array<unknown>(size).fill(Symbol.for('react.memo_cache_sentinel')),
}));

// jest/setup.ts replaces the whole hook module with fixed mock assets, which is the behavior this suite has to exercise.
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@hooks/useLazyAsset', () => jest.requireActual('@hooks/useLazyAsset'));

let illustrationCommitCount = 0;

function countIllustrationCommit() {
    illustrationCommitCount += 1;
}

function IllustrationProbe() {
    const {Abracadabra} = useMemoizedLazyIllustrations([ILLUSTRATION_NAME]);

    return typeof Abracadabra === 'function' ? <Abracadabra testID="illustration-placeholder" /> : null;
}

function ExpensifyIconProbe() {
    const {Bolt} = useMemoizedLazyExpensifyIcons([EXPENSIFY_ICON_NAME]);

    return typeof Bolt === 'function' ? <Bolt testID="expensify-icon-placeholder" /> : null;
}

describe('useMemoizedLazyIllustrations under a screen cover', () => {
    beforeEach(() => {
        mockIllustrations.reset();
        illustrationCommitCount = 0;
    });

    it('shows the illustration after a chunk load that resolved while the screen was covered', async () => {
        const home = renderScreenWithCover(<IllustrationProbe />);

        expect(screen.getByTestId('illustration-placeholder')).toBeOnTheScreen();

        await home.hide();
        await mockIllustrations.resolveLoad();

        // A covered screen keeps re-rendering at background priority, so this is the closure the reveal re-runs.
        await home.hide();
        await home.reveal();

        expect(screen.getByTestId('illustration-loaded')).toBeOnTheScreen();
        expect(screen.queryByTestId('illustration-placeholder')).not.toBeOnTheScreen();
    });

    it('commits once with the illustration when the chunk is already cached on mount', async () => {
        mockIllustrations.warmCache();

        const home = renderScreenWithCover(
            <Profiler
                id="illustration-probe"
                onRender={countIllustrationCommit}
            >
                <IllustrationProbe />
            </Profiler>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(illustrationCommitCount).toBe(1);
        expect(screen.getByTestId('illustration-loaded')).toBeOnTheScreen();

        await home.hide();
        await home.reveal();

        expect(screen.getByTestId('illustration-loaded')).toBeOnTheScreen();
    });

    it('drops a chunk load that resolves after a real unmount and shows the illustration on the next mount', async () => {
        const home = renderScreenWithCover(<IllustrationProbe />);

        home.unmount();
        await mockIllustrations.resolveLoad();

        renderScreenWithCover(<IllustrationProbe />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('illustration-loaded')).toBeOnTheScreen();
    });
});

describe('useMemoizedLazyExpensifyIcons under a screen cover', () => {
    beforeEach(() => {
        mockExpensifyIcons.reset();
    });

    it('shows the icon after a chunk load that resolved while the screen was covered', async () => {
        const home = renderScreenWithCover(<ExpensifyIconProbe />);

        expect(screen.getByTestId('expensify-icon-placeholder')).toBeOnTheScreen();

        await home.hide();
        await mockExpensifyIcons.resolveLoad();

        // A covered screen keeps re-rendering at background priority, so this is the closure the reveal re-runs.
        await home.hide();
        await home.reveal();

        expect(screen.getByTestId('expensify-icon-loaded')).toBeOnTheScreen();
        expect(screen.queryByTestId('expensify-icon-placeholder')).not.toBeOnTheScreen();
    });
});
