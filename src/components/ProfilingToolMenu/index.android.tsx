import React from 'react';
import RNFS from 'react-native-fs';
import CONST from '@src/CONST';
import BaseProfilingToolMenu from './BaseProfilingToolMenu';

function ProfilingToolMenu() {
    return (
        <BaseProfilingToolMenu
            pathToBeUsed={RNFS.DownloadDirectoryPath}
            displayPath={CONST.DOWNLOADS_PATH}
            showShareButton
        />
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default ProfilingToolMenu;
