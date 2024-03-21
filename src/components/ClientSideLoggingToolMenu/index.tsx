import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import * as Console from '@libs/actions/Console';
import type {Log} from '@libs/Console';
import ONYXKEYS from '@src/ONYXKEYS';

type CapturedLogs = Record<number, Log>;

type ClientSideLoggingToolMenuOnyxProps = {
    /** Logs captured on the current device */
    capturedLogs: OnyxEntry<CapturedLogs>;

    /** Whether or not logs should be stored */
    shouldStoreLogs: OnyxEntry<boolean>;
};

type ClientSideLoggingToolProps = ClientSideLoggingToolMenuOnyxProps;

function ClientSideLoggingToolMenu({shouldStoreLogs, capturedLogs}: ClientSideLoggingToolProps) {
    const onToggle = () => {
        if (!shouldStoreLogs) {
            Console.setShouldStoreLogs(true);
        } else {
            console.log({capturedLogs});
            Console.disableLoggingAndFlushLogs();
        }
    };

    return (
        <TestToolRow title="Client side logging">
            <Switch
                accessibilityLabel="Client side logging"
                isOn={!!shouldStoreLogs}
                onToggle={onToggle}
            />
        </TestToolRow>
    );
}

export default withOnyx<ClientSideLoggingToolProps, ClientSideLoggingToolMenuOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(ClientSideLoggingToolMenu);
