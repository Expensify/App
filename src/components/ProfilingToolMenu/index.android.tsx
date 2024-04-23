import React from 'react';
import RNFS from 'react-native-fs';
import BaseProfilingToolMenu from './BaseProfilingToolMenu';

function ProfilingToolMenu() {
    return (
        <BaseProfilingToolMenu
            pathToBeUsed={RNFS.DownloadDirectoryPath}
            displayPath="/Downloads"
        />
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default ProfilingToolMenu;
