import React, {useState} from 'react';
import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import Share from 'react-native-share';
import Button from '@components/Button';
import Switch from '@components/Switch';
import TestToolRow from '@components/TestToolRow';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import type {Log} from '@libs/Console';
import getOperatingSystem from '@libs/getOperatingSystem';
import localFileCreate from '@libs/localFileCreate';
import CONST from '@src/CONST';
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
            Console.setShouldStoreLogs(true);
        } else {
            if (capturedLogs) {
                const logs = Object.values(capturedLogs as Log[]);
                const logsWithParsedMessages = parseStringifyMessages(logs);
                localFileCreate('logs', JSON.stringify(logsWithParsedMessages, null, 2)).then((localFile) => {
                    if (getOperatingSystem() === CONST.OS.ANDROID) {
                        RNFetchBlob.MediaCollection.copyToMediaStore(
                            {
                                name: localFile.newFileName,
                                parentFolder: '',
                                mimeType: 'text/plain',
                            },
                            'Download',
                            localFile.path,
                        );
                    }
                    setFile(localFile);
                });
            } else {
                Alert.alert('No logs to share', 'There are no logs to share');
            }
            Console.disableLoggingAndFlushLogs();
        }
    };

    const shareLogs = () => {
        if (!file) {
            return;
        }
        Share.open({
            url: `file://${file.path}`,
        });
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

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default withOnyx<ClientSideLoggingToolProps, ClientSideLoggingToolMenuOnyxProps>({
    capturedLogs: {
        key: ONYXKEYS.LOGS,
    },
    shouldStoreLogs: {
        key: ONYXKEYS.SHOULD_STORE_LOGS,
    },
})(ClientSideLoggingToolMenu);
