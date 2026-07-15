/* eslint-disable rulesdir/no-inline-named-export, @typescript-eslint/naming-convention -- The scheduler package exposes unstable_* named exports, so this shim must mirror those exact names. Aliasing them satisfies lint but makes the React compiler compliance check fail. */
declare module 'scheduler' {
    type SchedulerCallback = (didTimeout: boolean) => void | null | SchedulerCallback;

    type CallbackNode = {
        callback: SchedulerCallback | null;
        expirationTime: number;
        id: number;
        priorityLevel: number;
        sortIndex: number;
    };

    export const unstable_IdlePriority: number;

    export function unstable_scheduleCallback(priorityLevel: number, callback: SchedulerCallback, options?: {delay?: number}): CallbackNode;

    export function unstable_cancelCallback(task: CallbackNode): void;
}
