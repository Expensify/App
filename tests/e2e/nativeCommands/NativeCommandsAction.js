const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
};

const makeTypeTextCommand = (text) => ({
    command: NativeCommandsAction.type,
    payload: {
        text,
    },
});

module.exports = {
    NativeCommandsAction,
    makeTypeTextCommand,
};
