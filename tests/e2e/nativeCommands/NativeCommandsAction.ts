import type {NativeCommand} from '@libs/E2E/client';

const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
    backspace: 'backspace',
    clear: 'clear',
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

const makeClearCommand = (): NativeCommand => ({
    actionName: NativeCommandsAction.clear,
});

export {NativeCommandsAction, makeTypeTextCommand, makeBackspaceCommand, makeClearCommand};
