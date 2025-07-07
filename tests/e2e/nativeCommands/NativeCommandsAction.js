"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeClearCommand = exports.makeBackspaceCommand = exports.makeTypeTextCommand = exports.NativeCommandsAction = void 0;
var NativeCommandsAction = {
    scroll: 'scroll',
    type: 'type',
    backspace: 'backspace',
    clear: 'clear',
};
exports.NativeCommandsAction = NativeCommandsAction;
var makeTypeTextCommand = function (text) { return ({
    actionName: NativeCommandsAction.type,
    payload: {
        text: text,
    },
}); };
exports.makeTypeTextCommand = makeTypeTextCommand;
var makeBackspaceCommand = function () { return ({
    actionName: NativeCommandsAction.backspace,
}); };
exports.makeBackspaceCommand = makeBackspaceCommand;
var makeClearCommand = function () { return ({
    actionName: NativeCommandsAction.clear,
}); };
exports.makeClearCommand = makeClearCommand;
