import React, {useState} from 'react';
import Share from 'react-native-share';
import useEnvironment from '@hooks/useEnvironment';
import getDownloadFolderPathSuffixForIOS from '@libs/getDownloadFolderPathSuffixForIOS';
import localFileCreate from '@libs/localFileCreate';
import CONST from '@src/CONST';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const {environment} = useEnvironment();

    const createFile = (logs: Log[]) => {
        localFileCreate('logs', JSON.stringify(logs, null, 2)).then((localFile) => {
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
            onDisableLogging={createFile}
            onShareLogs={shareLogs}
            displayPath={`${CONST.NEW_EXPENSIFY_PATH}${getDownloadFolderPathSuffixForIOS(environment)}/${file?.newFileName ?? ''}`}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
