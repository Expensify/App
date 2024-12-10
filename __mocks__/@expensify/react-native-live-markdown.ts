import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import type {parseExpensiMark} from '@expensify/react-native-live-markdown';

global.jsi_registerMarkdownWorklet = jest.fn();
global.jsi_setMarkdownRuntime = jest.fn();
global.jsi_registerMarkdownWorklet = jest.fn();
global.jsi_unregisterMarkdownWorklet = jest.fn();

const parseExpensiMarkMock: typeof parseExpensiMark = () => {
    'worklet';

    return [];
};

export {MarkdownTextInput, parseExpensiMarkMock as parseExpensiMark};
