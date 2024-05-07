import React from 'react';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';
import type ClientSideLoggingToolMenuProps from './types';

function ClientSideLoggingToolMenu({isViaTestToolsModal}: ClientSideLoggingToolMenuProps) {
    const downloadFile = (logs: Log[]) => {
        localFileDownload('logs', JSON.stringify(logs, null, 2));
    };

    return (
        <BaseClientSideLoggingToolMenu
            onDisableLogging={downloadFile}
            isViaTestToolsModal={isViaTestToolsModal}
        />
    );
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
