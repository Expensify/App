import React, {useState} from 'react';
import Share from 'react-native-share';
import useEnvironment from '@hooks/useEnvironment';
import type {Log} from '@libs/Console';
import getFolderPathSuffix from '@libs/getFolderPathSuffix';
import localFileCreate from '@libs/localFileCreate';
import CONST from '@src/CONST';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';

function ClientSideLoggingToolMenu() {
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
        <BaseClientSideLoggingToolMenu
            file={file}
            onEnableLogging={() => setFile(undefined)}
            onDisableLogging={createFile}
            onShareLogs={shareLogs}
            displayPath={`${CONST.NEW_EXPENSIFY_PATH}${getFolderPathSuffix(environment)}/${file?.newFileName ?? ''}`}
        />
    );
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
