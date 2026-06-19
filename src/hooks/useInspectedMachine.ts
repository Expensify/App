import {useMachine} from '@xstate/react';
import type {ActorOptions, AnyStateMachine} from 'xstate';
import xstateInspector from '@libs/XStateInspector';

/**
 * A drop-in replacement for `useMachine` that also wires up the dev-only Stately inspector. Use it
 * instead of `useMachine` so that every machine automatically appears in the inspector window
 * (Troubleshoot > XState inspector) with its sensitive fields masked.
 *
 * It is declared as an overload because the options parameter of `useMachine` is a conditional tuple
 * type that TypeScript cannot resolve for a generic machine. The implementation therefore uses
 * `AnyStateMachine`, for which the conditional does resolve, while callers still keep their precise
 * machine types.
 */
function useInspectedMachine<TMachine extends AnyStateMachine>(machine: TMachine, options?: ActorOptions<TMachine>): ReturnType<typeof useMachine<TMachine>>;
function useInspectedMachine(machine: AnyStateMachine, options?: ActorOptions<AnyStateMachine>): ReturnType<typeof useMachine<AnyStateMachine>> {
    return useMachine(machine, {...options, inspect: xstateInspector.inspect});
}

export default useInspectedMachine;
