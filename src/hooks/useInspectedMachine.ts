import {useMachine} from '@xstate/react';
import type {ActorOptions, AnyStateMachine} from 'xstate';
import xstateInspector from '@libs/XStateInspector';

/**
 * `useMachine` with the dev-only Stately inspector pre-wired. Use this instead of `useMachine`
 * so every machine automatically shows up in the inspector window (Troubleshoot > XState inspector)
 * with its sensitive fields masked.
 *
 * Declared as an overload because `useMachine`'s options parameter is a conditional tuple type that
 * TypeScript cannot resolve for a generic machine; the implementation instantiates it with
 * `AnyStateMachine` (where the conditional resolves) while callers keep the precise machine types.
 */
function useInspectedMachine<TMachine extends AnyStateMachine>(machine: TMachine, options?: ActorOptions<TMachine>): ReturnType<typeof useMachine<TMachine>>;
function useInspectedMachine(machine: AnyStateMachine, options?: ActorOptions<AnyStateMachine>): ReturnType<typeof useMachine<AnyStateMachine>> {
    return useMachine(machine, {...options, inspect: xstateInspector.inspect});
}

export default useInspectedMachine;
