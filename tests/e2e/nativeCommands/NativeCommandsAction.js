const NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
};

const makeTypeTextCommand = (text) => ({
    actionName: NativeCommandsAction.type,
    payload: {
        text,
    },
});

module.exports = {
    NativeCommandsAction,
    makeTypeTextCommand,
};
