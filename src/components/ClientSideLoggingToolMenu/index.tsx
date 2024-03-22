import React, {useState} from 'react';
import {Share} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import type {Log} from '@libs/Console';
import localFileCreate from '@libs/localFileCreate';
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
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const styles = useThemeStyles();

    const onToggle = () => {
        if (!shouldStoreLogs) {
            setFile(undefined);
            Console.setShouldStoreLogs(true);
        } else {
            const logs = Object.values(capturedLogs as Log[]);
            const logsWithParsedMessages = parseStringifyMessages(logs);
            localFileCreate('logs', JSON.stringify(logsWithParsedMessages, null, 2)).then((localFile) => {
                setFile(localFile);
            });
            Console.disableLoggingAndFlushLogs();
        }
    };

    const shareLogs = () => {
        if (!file) {
            return;
        }

        Share.share({url: file.path, title: file.newFileName});
    };

    return (
        <>
            <TestToolRow title="Client side logging">
                <Switch
                    accessibilityLabel="Client side logging"
                    isOn={!!shouldStoreLogs}
                    onToggle={onToggle}
                />
            </TestToolRow>
            {!!file && (
                <>
                    <Text style={[styles.textLabelSupporting, styles.mb4]}>{`path: ${file.path}`}</Text>
                    <TestToolRow title="Logs">
                        <Button
                            small
                            text="Share"
                            onPress={shareLogs}
                        />
                    </TestToolRow>
                </>
            )}
        </>
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
