import React from 'react';
import type {Log} from '@libs/Console';
import localFileDownload from '@libs/localFileDownload';
import BaseClientSideLoggingToolMenu from './BaseClientSideLoggingToolMenu';

function ClientSideLoggingToolMenu() {
    const downloadFile = (logs: Log[]) => {
        localFileDownload('logs', JSON.stringify(logs, null, 2));
    };

    return <BaseClientSideLoggingToolMenu onDisableLogging={downloadFile} />;
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
