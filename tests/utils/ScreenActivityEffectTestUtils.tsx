import {render} from '@testing-library/react-native';

import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType, DependencyList, EffectCallback, ReactElement, ReactNode} from 'react';

import React, {act, Activity, createContext, useContext, useEffect, useSyncExternalStore} from 'react';

/**
 * The primitives a test needs to run one structure on useEffect and on useScreenActivityEffect and compare the effect
 * calls commit by commit: the two screens a non-top screen behavior builds, the effect that records its calls, and the
 * recorder around them. A test writes the tree it renders itself, so nothing here holds a table of structures.
 *
 * A recorded commit holds the work the hook runs right after it as well: the hook releases a component removed while
 * hidden once the commit is over, from a microtask React does not wait for, so every step settles before it drains.
 */

type AnyEffectHook = (setup: EffectCallback, deps: DependencyList) => void;

let calls: string[] = [];

function log(message: string) {
    calls.push(message);
}

/** The calls recorded since the last drain, which is one commit worth of them when a test drains after every step. */
function drainLog(): string[] {
    const drained = calls;
    calls = [];
    return drained;
}

function resetLog() {
    calls = [];
}

/** Runs what the hook queued for right after the last commit, which is where it releases a component removed while hidden. */
async function settle(): Promise<void> {
    // eslint-disable-next-line testing-library/no-unnecessary-act -- the empty act is the point: it runs the microtask the hook queued and commits the updates a release makes
    await act(async () => {});
}

/** A setup that logs its own call and returns a cleanup logging the matching one under the same name. */
function track(name: string): EffectCallback {
    return () => {
        log(`setup:${name}`);
        return () => log(`cleanup:${name}`);
    };
}

const AnyEffectHookContext = createContext<AnyEffectHook>(useEffect);

/** The hook of the current run, which is the one thing a test changes when it runs the same structure twice. */
function useAnyEffect(setup: EffectCallback, deps: DependencyList) {
    const hook = useContext(AnyEffectHookContext);
    hook(setup, deps);
}

/** Renders outside the screen, so the hook of a run is settled before the first component of it renders. */
function AnyEffectHookProvider({hook, children}: {hook: AnyEffectHook; children: ReactNode}) {
    return <AnyEffectHookContext.Provider value={hook}>{children}</AnyEffectHookContext.Provider>;
}

/** The effect a test renders when it has nothing to say about the component holding it, named when a test holds several. */
function Subject({name = 's', value}: {name?: string; value: string}) {
    useAnyEffect(track(`${name}:${value}`), [value]);
    return null;
}

/** An effect that a cover releases and a reveal sets up again, for a test about a screen running both hooks. */
function PlainEffect({value}: {value: string}) {
    useEffect(() => track(`plain:${value}`)(), [value]);
    return null;
}

/** An effect that is meant to survive a cover, for a test about a screen running both hooks. */
function KeptEffect({value}: {value: string}) {
    useScreenActivityEffect(() => track(`kept:${value}`)(), [value]);
    return null;
}

type ScreenProps = {isHidden: boolean; children: ReactNode};

/** A screen on the 'none' behavior, which wrapDescriptorsWithNonTopScreensBehavior leaves unwrapped and so alive. */
function LiveScreen({children}: ScreenProps) {
    return children;
}

/** A screen on the 'activity' behavior, which is what ScreenActivityWrapper builds around the screen content. */
function ActivityScreen({isHidden, children}: ScreenProps) {
    return <Activity mode={isHidden ? 'hidden' : 'visible'}>{children}</Activity>;
}

type LeafOverride = {content: ReactNode} | null;

/** What the Leaf renders instead of its children after a leaf step, until the next render step clears it. */
const leafStore = {
    override: null as LeafOverride,
    listeners: new Set<() => void>(),
    subscribe: (listener: () => void) => {
        leafStore.listeners.add(listener);
        return () => leafStore.listeners.delete(listener);
    },
    getSnapshot: (): LeafOverride => leafStore.override,
    /** Sets the override and re-renders every Leaf, as one commit that starts below the screen. */
    publish: (override: LeafOverride) => {
        leafStore.override = override;
        for (const listener of leafStore.listeners) {
            listener();
        }
    },
};

/**
 * Renders its children, or the content of the last leaf step, so a leaf step changes the content of the screen in a
 * commit that starts below the screen and renders nothing above it. A render step clears the override before it
 * renders, so a step of either kind describes the whole content of the screen.
 */
function Leaf({children}: {children: ReactNode}) {
    const override = useSyncExternalStore(leafStore.subscribe, leafStore.getSnapshot);
    return override === null ? children : override.content;
}

/** One rendered state of a screen: what it holds, and whether the screen on top of it covers it. */
type RenderStep = {isHidden: boolean; children: ReactNode};

/** A change of what the Leaf of the screen holds, as a commit that starts below the screen and renders nothing above it. */
type LeafStep = {leafContent: ReactNode};

type Step = RenderStep | LeafStep;

function visible(children: ReactNode): RenderStep {
    return {isHidden: false, children};
}

function hidden(children: ReactNode): RenderStep {
    return {isHidden: true, children};
}

function leaf(content: ReactNode): LeafStep {
    return {leafContent: content};
}

function isLeafStep(step: Step | ReactElement): step is LeafStep {
    return 'leafContent' in step;
}

/**
 * The calls of every commit of the trees given, the last commit being the screen leaving the navigation stack. A leaf
 * step among them commits through the Leaf the previous tree rendered rather than through a render of the root.
 */
async function record(trees: ReadonlyArray<ReactElement | LeafStep>): Promise<string[][]> {
    const [first, ...rest] = trees;
    if (first === undefined || isLeafStep(first)) {
        throw new Error('The first step has to render the screen.');
    }
    leafStore.override = null;
    const {rerender, unmount} = render(first);
    await settle();
    const commits = [drainLog()];

    for (const tree of rest) {
        if (isLeafStep(tree)) {
            act(() => leafStore.publish({content: tree.leafContent}));
        } else {
            // The render below re-renders the Leaf anyway, so the override goes silently, as part of that one commit.
            leafStore.override = null;
            rerender(tree);
        }
        await settle();
        commits.push(drainLog());
    }

    unmount();
    await settle();
    commits.push(drainLog());

    return commits;
}

/** Puts the steps through one screen on one hook, which is one of the configurations a test compares. */
function runOn(hook: AnyEffectHook, Screen: ComponentType<ScreenProps>, steps: readonly Step[]): Promise<string[][]> {
    const tree = (step: RenderStep) => (
        <AnyEffectHookProvider hook={hook}>
            <Screen isHidden={step.isHidden}>{step.children}</Screen>
        </AnyEffectHookProvider>
    );
    return record(steps.map((step) => (isLeafStep(step) ? step : tree(step))));
}

/**
 * The same steps under the four configurations. liveUseEffect is the baseline of a screen that stays live in the
 * background, activityUseEffect is what a screen gets today, and activityScreenActivityEffect is the hook at work.
 */
async function runEveryConfig(steps: readonly Step[]) {
    return {
        liveUseEffect: await runOn(useEffect, LiveScreen, steps),
        liveScreenActivityEffect: await runOn(useScreenActivityEffect, LiveScreen, steps),
        activityUseEffect: await runOn(useEffect, ActivityScreen, steps),
        activityScreenActivityEffect: await runOn(useScreenActivityEffect, ActivityScreen, steps),
    };
}

type Runs = Awaited<ReturnType<typeof runEveryConfig>>;

/** All four configurations ran the steps identically, which is the claim for every structure that never hides. */
function expectEveryConfigToMatch(runs: Runs, expected: string[][]) {
    expect(runs.liveUseEffect).toEqual(expected);
    expect(runs.liveScreenActivityEffect).toEqual(expected);
    expect(runs.activityUseEffect).toEqual(expected);
    expect(runs.activityScreenActivityEffect).toEqual(expected);
}

export {
    ActivityScreen,
    AnyEffectHookProvider,
    drainLog,
    expectEveryConfigToMatch,
    hidden,
    isLeafStep,
    KeptEffect,
    leaf,
    Leaf,
    LiveScreen,
    log,
    PlainEffect,
    record,
    resetLog,
    runEveryConfig,
    runOn,
    settle,
    Subject,
    track,
    useAnyEffect,
    visible,
};
export type {AnyEffectHook, RenderStep, ScreenProps, Step};
