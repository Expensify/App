import React, {useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import localFileCreate from '@libs/localFileCreate';
import CONST from '@src/CONST';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();

    const createAndSaveFile = (logs: Log[]) => {
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
        <BaseRecordTroubleshootDataToolMenu
            file={file}
            onEnableLogging={() => setFile(undefined)}
            onDisableLogging={createAndSaveFile}
            onShareLogs={shareLogs}
            displayPath={`${CONST.DOWNLOADS_PATH}/${file?.newFileName ?? ''}`}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
