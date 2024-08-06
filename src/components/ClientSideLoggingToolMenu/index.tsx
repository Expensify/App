import React, {useState} from 'react';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import type {File} from './BaseClientSideLoggingToolMenu';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';

function ClientSideLoggingToolMenu() {
    const [localLogs, setLocalLogs] = useState<Log[]>([]);
    const [file, setFile] = useState<File | undefined>(undefined);
    const downloadFile = (logs: Log[]) => {
        const data = JSON.stringify(logs, null, 2);
        setFile({
            path: './logs',
            newFileName: 'logs',
            size: data.length,
        });
        setLocalLogs(logs);
        localFileDownload('logs', data);
    };
    const hideShareButton = () => {
        setFile(undefined);
    };
    const shareLogs = () => {
        downloadFile(localLogs);
    };

    return (
        <BaseClientSideLoggingToolMenu
            file={file}
            onDisableLogging={downloadFile}
            onEnableLogging={hideShareButton}
            onShareLogs={shareLogs}
            displayPath={file?.path}
        />
    );
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
