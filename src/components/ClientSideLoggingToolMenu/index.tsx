import React from 'react';
import {withOnyx} from 'react-native-onyx';
import * as Console from '@libs/actions/Console';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';
import type {ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps} from './types';

function ClientSideLoggingToolMenu({capturedLogs, shouldStoreLogs}: ClientSideLoggingToolProps) {
    const onToggle = (logs: Log[]) => {
        localFileDownload('logs', JSON.stringify(logs, null, 2));
        Console.disableLoggingAndFlushLogs();
    };

    return (
        <BaseClientSideLoggingToolMenu
            onToggleSwitch={onToggle}
            shouldStoreLogs={shouldStoreLogs}
            capturedLogs={capturedLogs}
        />
    );
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default withOnyx<ClientSideLoggingToolProps, ClientSideLoggingToolMenuOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(ClientSideLoggingToolMenu);
