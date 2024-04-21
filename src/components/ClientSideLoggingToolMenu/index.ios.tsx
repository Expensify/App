import React, {useState} from 'react';
import Share from 'react-native-share';
import type {Log} from '@libs/Console';
import localFileCreate from '@libs/localFileCreate';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';

function ClientSideLoggingToolMenu({isViaTestToolsModal = false, closeTestToolsModal}) {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();

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
            isViaTestToolsModal={isViaTestToolsModal}
            closeTestToolsModal={closeTestToolsModal}
        />
    );
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
