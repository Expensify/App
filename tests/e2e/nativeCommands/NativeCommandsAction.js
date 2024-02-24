const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
    backspace: 'backspace',
};

const makeTypeTextCommand = (text) => ({
    actionName: NativeCommandsAction.type,
    payload: {
        text,
    },
});

const makeBackspaceCommand = () => ({
    actionName: NativeCommandsAction.backspace,
});

export {NativeCommandsAction, makeTypeTextCommand, makeBackspaceCommand};
