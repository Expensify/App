import type {NativeCommand} from '@libs/E2E/client';

const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
    backspace: 'backspace',
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

export {NativeCommandsAction, makeTypeTextCommand, makeBackspaceCommand};
