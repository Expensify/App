import type {NativeCommand} from '@libs/E2E/client';

const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
    backspace: 'backspace',
    enter: 'enter',
} as const;

const makeTypeTextCommand = (text: string): NativeCommand => ({
    actionName: NativeCommandsAction.type,
    payload: {
        text,
    },
});

const makeBackspaceCommand = (): NativeCommand => ({
    actionName: NativeCommandsAction.backspace,
});

const makeEnterCommand = (): NativeCommand => ({
    actionName: NativeCommandsAction.enter,
});

export {NativeCommandsAction, makeTypeTextCommand, makeBackspaceCommand, makeEnterCommand};
