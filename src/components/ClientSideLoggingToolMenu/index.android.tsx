import React, {useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import {withOnyx} from 'react-native-onyx';
import Share from 'react-native-share';
import * as Console from '@libs/actions/Console';
import type {Log} from '@libs/Console';
import localFileCreate from '@libs/localFileCreate';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';
import type {ClientSideLoggingToolMenuOnyxProps, ClientSideLoggingToolProps} from './types';

function ClientSideLoggingToolMenu({shouldStoreLogs, capturedLogs}: ClientSideLoggingToolProps) {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();

    const onToggle = (logs: Log[]) => {
        localFileCreate('logs', JSON.stringify(logs, null, 2)).then((localFile) => {
            RNFetchBlob.MediaCollection.copyToMediaStore(
                {
                    name: localFile.newFileName,
                    parentFolder: '',
                    mimeType: 'text/plain',
                },
                'Download',
                localFile.path,
            );
            setFile(localFile);
        });
        Console.disableLoggingAndFlushLogs();
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
            shouldStoreLogs={shouldStoreLogs}
            capturedLogs={capturedLogs}
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
