import React, {useState} from 'react';
import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import {withOnyx} from 'react-native-onyx';
import Share from 'react-native-share';
import * as Console from '@libs/actions/Console';
import {parseStringifyMessages} from '@libs/Console';
import type {Log} from '@libs/Console';
import getOperatingSystem from '@libs/getOperatingSystem';
import localFileCreate from '@libs/localFileCreate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';
import type {ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps} from './types';

function ClientSideLoggingToolMenu({shouldStoreLogs, capturedLogs}: ClientSideLoggingToolProps) {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();

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
        <BaseClientSideLoggingToolMenu
            file={file}
            onToggleSwitch={onToggle}
            onShareLogs={shareLogs}
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
