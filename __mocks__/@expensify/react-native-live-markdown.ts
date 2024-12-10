import {MarkdownTextInput} from '@expensify/react-native-live-markdown';

global.jsi_registerMarkdownWorklet = jest.fn();
global.jsi_setMarkdownRuntime = jest.fn();
global.jsi_registerMarkdownWorklet = jest.fn();
global.jsi_unregisterMarkdownWorklet = jest.fn();

function parseExpensiMark() {
    'worklet';
    return [];
}

export {MarkdownTextInput, parseExpensiMark};
