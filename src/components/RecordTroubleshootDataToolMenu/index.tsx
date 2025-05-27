import React, {useState} from 'react';
import localFileDownload from '@libs/localFileDownload';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';
import type {File} from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
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
        <BaseRecordTroubleshootDataToolMenu
            file={file}
            onDisableLogging={downloadFile}
            onEnableLogging={hideShareButton}
            onShareLogs={shareLogs}
            displayPath={file?.path}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
