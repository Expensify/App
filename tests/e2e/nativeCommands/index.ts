import type {NativeCommandPayload} from '@libs/E2E/client';
import adbBackspace from './adbBackspace';
import adbClear from './adbClear';
import adbTypeText from './adbTypeText';
// eslint-disable-next-line rulesdir/prefer-import-module-contents
import {NativeCommandsAction} from './NativeCommandsAction';

const executeFromPayload = (actionName?: string, payload?: NativeCommandPayload): Promise<boolean> => {
    switch (actionName) {
        case NativeCommandsAction.scroll:
            throw new Error('Not implemented yet');
        case NativeCommandsAction.type:
            return adbTypeText(payload?.text ?? '');
        case NativeCommandsAction.backspace:
            return adbBackspace();
        case NativeCommandsAction.clear:
            return adbClear();
        default:
            throw new Error(`Unknown action: ${actionName}`);
    }
};

export {NativeCommandsAction, executeFromPayload, adbTypeText};
