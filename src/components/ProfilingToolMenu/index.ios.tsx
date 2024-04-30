import React from 'react';
import RNFS from 'react-native-fs';
import useEnvironment from '@hooks/useEnvironment';
import getFolderPathSuffix from '@libs/getFolderPathSuffix';
import CONST from '@src/CONST';
import BaseProfilingToolMenu from './BaseProfilingToolMenu';

function ProfilingToolMenu() {
    const {environment} = useEnvironment();

    return (
        <BaseProfilingToolMenu
            pathToBeUsed={RNFS.DocumentDirectoryPath}
            displayPath={`${CONST.NEW_EXPENSIFY_PATH}${getFolderPathSuffix(environment)}`}
        />
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default ProfilingToolMenu;
