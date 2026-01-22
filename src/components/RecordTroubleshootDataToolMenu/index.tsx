import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import useOnyx from '@hooks/useOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';
import type {File} from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<File | undefined>(undefined);
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE, {canBeMissing: true});

    const zipRef = useRef(new JSZip());

    const onDisableLogging = (logs: Log[]) => {
        const data = JSON.stringify(logs, null, 2);
        const newFileName = appendTimeToFileName('logs.txt');
        zipRef.current.file(newFileName, data);

        return ExportOnyxState.readFromOnyxDatabase()
            .then((value: Record<string, unknown>) => {
                const dataToShare = JSON.stringify(ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState));
                zipRef.current.file(CONST.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
            })
            .then(() => {
                setFile({
                    path: './logs',
                    newFileName: 'logs',
                    size: data.length,
                });
            });
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
            link.download = zipArchiveName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            zipRef.current = new JSZip();
            setFile(undefined);
        });
    };

    return (
        <BaseRecordTroubleshootDataToolMenu
            zipRef={zipRef}
            file={file}
            onDisableLogging={onDisableLogging}
            onEnableLogging={hideShareButton}
            pathToBeUsed=""
            onDownloadZip={onDownloadZip}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
