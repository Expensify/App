import React from 'react';
import RNFS from 'react-native-fs';
import useEnvironment from '@hooks/useEnvironment';
import getDownloadFolderPathSuffixForIOS from '@libs/getDownloadFolderPathSuffixForIOS';
import CONST from '@src/CONST';
import BaseProfilingToolMenu from './BaseProfilingToolMenu';

function ProfilingToolMenu() {
    const {environment} = useEnvironment();

    return (
        <BaseProfilingToolMenu
            pathToBeUsed={RNFS.DocumentDirectoryPath}
            displayPath={`${CONST.NEW_EXPENSIFY_PATH}${getDownloadFolderPathSuffixForIOS(environment)}`}
            showShareButton
        />
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default ProfilingToolMenu;
