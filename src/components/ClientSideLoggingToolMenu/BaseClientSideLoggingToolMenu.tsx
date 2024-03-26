import React from 'react';
import {Alert} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseClientSideLoggingToolMenuOnyxProps, BaseClientSideLoggingToolProps} from './types';

function BaseClientSideLoggingToolMenu({shouldStoreLogs, capturedLogs, file, onShareLogs, onToggleSwitch, onEnableLogging}: BaseClientSideLoggingToolProps) {
    const onToggle = () => {
        if (!shouldStoreLogs) {
            Console.setShouldStoreLogs(true);

            if (onEnableLogging) {
                onEnableLogging();
            }

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
        Console.disableLoggingAndFlushLogs();
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

export default withOnyx<BaseClientSideLoggingToolProps, BaseClientSideLoggingToolMenuOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(BaseClientSideLoggingToolMenu);
