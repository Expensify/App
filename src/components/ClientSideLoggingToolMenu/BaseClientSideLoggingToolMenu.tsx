import React from 'react';
import {Alert} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import type {CapturedLogs, Log} from '@src/types/onyx';

type BaseClientSideLoggingToolProps = {
    shouldStoreLogs: OnyxEntry<boolean>;
    capturedLogs: OnyxEntry<CapturedLogs>;
    file?: {path: string; newFileName: string; size: number};
    onShareLogs?: () => void;
    onToggleSwitch: (logs: Log[]) => void;
};

function BaseClientSideLoggingToolMenu({shouldStoreLogs, capturedLogs, file, onShareLogs, onToggleSwitch}: BaseClientSideLoggingToolProps) {
    const onToggle = () => {
        if (!shouldStoreLogs) {
            Console.setShouldStoreLogs(true);
            return;
        }

        if (!capturedLogs) {
            Alert.alert('No logs to share', 'There are no logs to share');
            Console.disableLoggingAndFlushLogs();
            return;
        }

        const logs = Object.values(capturedLogs);
        const logsWithParsedMessages = parseStringifyMessages(logs);

        onToggleSwitch(logsWithParsedMessages);
    };
    const styles = useThemeStyles();
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
                            onPress={onShareLogs}
                        />
                    </TestToolRow>
                </>
            )}
        </>
    );
}

BaseClientSideLoggingToolMenu.displayName = 'BaseClientSideLoggingToolMenu';

export default BaseClientSideLoggingToolMenu;
