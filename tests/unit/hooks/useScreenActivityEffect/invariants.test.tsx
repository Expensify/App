import useScreenActivityEffect from '@hooks/useScreenActivityEffect';

import type {ComponentType, ReactNode} from 'react';
import type {TupleToUnion} from 'type-fest';

import React, {useEffect} from 'react';

import type {AnyEffectHook, ScreenProps, Step} from '../../../utils/ScreenActivityEffectTestUtils';

import {ActivityScreen, hidden, leaf, Leaf, LiveScreen, log, resetLog, runOn, useAnyEffect, visible} from '../../../utils/ScreenActivityEffectTestUtils';

/**
 * Every other suite here is a scenario somebody thought of. This one generates them: it walks every sequence of a few
 * commits a screen can go through and holds both hooks to the invariants instead of to an exact log, which is the only
 * way to cover a sequence nobody imagined. The live screen on useEffect is run through the same checks, so a mistake in
 * the checks themselves shows up as a violation of the baseline rather than as a passing suite.
 */

/** How long the generated sequences are, not counting the mount and the screen leaving the navigation stack. */
const SEQUENCE_LENGTH = 6;

/** The commits a screen and its content can go through, each one changing something the hook has to answer for. */
const OPERATIONS = ['cover', 'reveal', 'changeValue', 'remove', 'mount'] as const;

/**
 * The same changes of the content started from state inside the screen, which commits without rendering the screen.
 * They make the generated set larger, so the sequences holding them are one commit shorter.
 */
const LEAF_OPERATIONS = ['leafChangeValue', 'leafRemove', 'leafMount'] as const;

const LEAF_SEQUENCE_LENGTH = 5;

type Operation = TupleToUnion<typeof OPERATIONS> | TupleToUnion<typeof LEAF_OPERATIONS>;

/** One rendered state of the generated screen: whether a screen covers it, what it holds, and where the commit came from. */
type ScreenState = {isHidden: boolean; instance: number; value: string; isMounted: boolean; isFromLeaf: boolean};

const FIRST_STATE: ScreenState = {isHidden: false, instance: 1, value: 'a', isMounted: true, isFromLeaf: false};

/** An effect whose calls name the instance they belong to and the value they were set up with. */
function TrackedSubject({instance, value}: {instance: number; value: string}) {
    useAnyEffect(() => {
        log(`setup:${instance}:${value}`);
        return () => log(`cleanup:${instance}:${value}`);
    }, [value]);
    return null;
}

/** Applies one operation, or answers that it would change nothing here, which keeps the generated set to real commits. */
function applyOperation(state: ScreenState, operation: Operation): ScreenState | undefined {
    const fromRoot = {...state, isFromLeaf: false};
    const fromLeaf = {...state, isFromLeaf: true};
    switch (operation) {
        case 'cover':
            return state.isHidden ? undefined : {...fromRoot, isHidden: true};
        case 'reveal':
            return state.isHidden ? {...fromRoot, isHidden: false} : undefined;
        case 'changeValue':
            return state.isMounted ? {...fromRoot, value: state.value === 'a' ? 'b' : 'a'} : undefined;
        case 'remove':
            return state.isMounted ? {...fromRoot, isMounted: false} : undefined;
        case 'mount':
            return state.isMounted ? undefined : {...fromRoot, isMounted: true, instance: state.instance + 1};
        case 'leafChangeValue':
            return state.isMounted ? {...fromLeaf, value: state.value === 'a' ? 'b' : 'a'} : undefined;
        case 'leafRemove':
            return state.isMounted ? {...fromLeaf, isMounted: false} : undefined;
        case 'leafMount':
            return state.isMounted ? undefined : {...fromLeaf, isMounted: true, instance: state.instance + 1};
        default:
            return undefined;
    }
}

/** Every sequence of the length given, as the states the screen goes through, the mount included. */
function generateSequences(operations: readonly Operation[], states: readonly ScreenState[], current: ScreenState, remaining: number): ScreenState[][] {
    if (remaining === 0) {
        return [[...states]];
    }

    const sequences: ScreenState[][] = [];
    for (const operation of operations) {
        const next = applyOperation(current, operation);
        if (next !== undefined) {
            sequences.push(...generateSequences(operations, [...states, next], next, remaining - 1));
        }
    }
    return sequences;
}

function toChildren(state: ScreenState) {
    if (!state.isMounted) {
        return null;
    }
    return (
        <TrackedSubject
            key={state.instance}
            instance={state.instance}
            value={state.value}
        />
    );
}

/** The content as the Leaf of the screen holds it, from the root for a render step and from its own state for a leaf step. */
function toStepWithContent(state: ScreenState, content: ReactNode): Step {
    if (state.isFromLeaf) {
        return leaf(content);
    }
    const children = <Leaf>{content}</Leaf>;
    return state.isHidden ? hidden(children) : visible(children);
}

function toStep(state: ScreenState): Step {
    return toStepWithContent(state, toChildren(state));
}

/** The same content one navigator deeper, where the <Activity> of the nested screen comes and goes with the content. */
function toNestedStep(state: ScreenState): Step {
    return toStepWithContent(state, state.isMounted ? <ActivityScreen isHidden={false}>{toChildren(state)}</ActivityScreen> : null);
}

/** The live setup of one instance as the log describes it: how many are live, and the value the last one ran with. */
type LiveSetup = {count: number; value: string};

/**
 * Holds one run to what has to be true of it whatever the sequence was: no instance ever holds two live setups at once,
 * no cleanup arrives for an instance that has none, a visible screen has a live setup for what it holds and that setup
 * ran with the value the screen is holding, a component removed from a screen nobody covered is released in that same
 * commit, and the screen leaving the stack releases everything.
 */
function findViolations(states: readonly ScreenState[], commits: readonly string[][]): string[] {
    const violations: string[] = [];
    const liveSetups = new Map<string, LiveSetup>();

    for (const [index, commit] of commits.entries()) {
        for (const call of commit) {
            const [kind, instance, value] = call.split(':');
            const live = liveSetups.get(instance) ?? {count: 0, value: ''};
            if (kind === 'setup') {
                if (live.count > 0) {
                    violations.push(`instance ${instance} held two live setups at commit ${index}`);
                }
                liveSetups.set(instance, {count: live.count + 1, value});
            } else {
                if (live.count === 0) {
                    violations.push(`instance ${instance} was released with nothing live at commit ${index}`);
                }
                liveSetups.set(instance, {count: live.count - 1, value: live.value});
            }
        }

        const state = states.at(index);
        const previous = states.at(index - 1);
        const wasRemoved = previous?.isMounted && (!state?.isMounted || previous.instance !== state.instance);
        if (wasRemoved && previous !== undefined && !previous.isHidden && state?.isHidden === false) {
            const live = liveSetups.get(String(previous.instance));
            if (live !== undefined && live.count !== 0) {
                violations.push(`instance ${previous.instance} was removed from a visible screen and not released at commit ${index}`);
            }
        }

        if (state?.isMounted && !state.isHidden) {
            const live = liveSetups.get(String(state.instance));
            if (live?.count !== 1) {
                violations.push(`the visible screen held no live setup for instance ${state.instance} at commit ${index}`);
            } else if (live.value !== state.value) {
                violations.push(`the live setup of instance ${state.instance} ran with ${live.value} instead of ${state.value} at commit ${index}`);
            }
        }
    }

    for (const [instance, live] of liveSetups) {
        if (live.count !== 0) {
            violations.push(`instance ${instance} was still live after the screen left the stack`);
        }
    }

    return violations;
}

function describeCommit(state: ScreenState): string {
    if (state.isFromLeaf) {
        return 'leaf';
    }
    return state.isHidden ? 'hidden' : 'visible';
}

function describeSequence(states: readonly ScreenState[]): string {
    return states.map((state) => `${describeCommit(state)}(${state.isMounted ? `${state.instance}:${state.value}` : 'empty'})`).join(' ');
}

/** The violations of one configuration over every generated sequence, each one naming the sequence it came from. */
async function sweep(hook: AnyEffectHook, Screen: ComponentType<ScreenProps>, sequences: readonly ScreenState[][], asStep: (state: ScreenState) => Step = toStep) {
    const problems: string[] = [];
    const runs: string[][][] = [];
    let setupCount = 0;

    for (const states of sequences) {
        resetLog();
        const commits = await runOn(hook, Screen, states.map(asStep));
        runs.push(commits);
        setupCount += commits.flat().filter((call) => call.startsWith('setup:')).length;
        problems.push(...findViolations(states, commits).map((violation) => `${violation} of ${describeSequence(states)}`));
    }

    return {problems, runs, setupCount};
}

/** The two generated sets: the commits the root renders, and those plus the ones a leaf starts without rendering the screen. */
const GENERATED_SETS = [
    {name: 'from the root', operations: OPERATIONS, length: SEQUENCE_LENGTH},
    {name: 'from the root and from a leaf', operations: [...OPERATIONS, ...LEAF_OPERATIONS], length: LEAF_SEQUENCE_LENGTH},
];

describe.each(GENERATED_SETS)('useScreenActivityEffect over every generated sequence of commits $name', ({operations, length}) => {
    const sequences = generateSequences(operations, [FIRST_STATE], FIRST_STATE, length);

    it('holds the covered screen on useScreenActivityEffect to the same invariants', async () => {
        // When the hook goes through every generated sequence behind an <Activity>
        const live = await sweep(useEffect, LiveScreen, sequences);
        const activity = await sweep(useScreenActivityEffect, ActivityScreen, sequences);

        // Then the baseline validates the checks, and every setup is released exactly once, no instance ever holds two,
        // and a visible screen is up to date
        expect(live.problems).toEqual([]);
        expect(activity.problems).toEqual([]);

        // And it never ran more work than the live screen did, because a cover can only ever leave work out
        expect(activity.setupCount).toBeLessThanOrEqual(live.setupCount);
    });

    it('answers the same commit by commit when the screen sits one navigator deeper', async () => {
        // When the same sequences run on a screen of a nested navigator, whose <Activity> comes and goes with its content
        const flat = await sweep(useScreenActivityEffect, ActivityScreen, sequences);
        const nested = await sweep(useScreenActivityEffect, ActivityScreen, sequences, toNestedStep);

        // Then nesting changes nothing at all: not what runs, not when, and not which invariant holds. A release that
        // the nesting moves to a later commit is the shape a nested <Activity> would leak in, so it is the whole point
        // of comparing commit by commit rather than comparing the flattened calls.
        expect(nested.problems).toEqual([]);
        const moved = sequences.filter((states, index) => JSON.stringify(nested.runs.at(index)) !== JSON.stringify(flat.runs.at(index))).map(describeSequence);
        expect(moved).toEqual([]);
    });
});
