import React from 'react';
import {Alert} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';
import type {ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps} from './types';

function ClientSideLoggingToolMenu({capturedLogs, shouldStoreLogs}: ClientSideLoggingToolProps) {
    const onToggle = () => {
        if (!shouldStoreLogs) {
            Console.setShouldStoreLogs(true);
        } else {
            if (!capturedLogs) {
                Alert.alert('No logs to share', 'There are no logs to share');
            }
            const logs = Object.values(capturedLogs as Log[]);
            const logsWithParsedMessages = parseStringifyMessages(logs);

            localFileDownload('logs', JSON.stringify(logsWithParsedMessages, null, 2));
            Console.disableLoggingAndFlushLogs();
        }
    };
    return <BaseClientSideLoggingToolMenu onToggleSwitch={onToggle} />;
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
