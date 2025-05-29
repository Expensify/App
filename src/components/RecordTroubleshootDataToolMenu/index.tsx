import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';
import type {File} from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<File | undefined>(undefined);

    const zipRef = useRef(new JSZip());

    const onDisableLogging = (logs: Log[]) => {
        const data = JSON.stringify(logs, null, 2);
        setFile({
            path: './logs',
            newFileName: 'logs',
            size: data.length,
        });
        const newFileName = appendTimeToFileName('logs.txt');
        zipRef.current.file(newFileName, data);
    };
    const hideShareButton = () => {
        setFile(undefined);
    };

    const onDownloadZip = () => {
        if (!zipRef.current?.files) {
            return;
        }

        zipRef.current.generateAsync({type: 'blob'}).then((zipBlob) => {
            const zipUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.href = zipUrl;
            const zipArchiveName = appendTimeToFileName('troubleshoot.zip');
            // link.download = 'troubleshoot.zip';
            link.download = zipArchiveName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    };

    return (
        <BaseRecordTroubleshootDataToolMenu
            zipRef={zipRef}
            file={file}
            onDisableLogging={onDisableLogging}
            onEnableLogging={hideShareButton}
            displayPath={file?.path}
            pathToBeUsed=""
            displayPath2=""
            onDownloadZip={onDownloadZip}
        />
    );
}

RecordTroubleshootDataToolMenu.displayName = 'RecordTroubleshootDataToolMenu';

export default RecordTroubleshootDataToolMenu;
