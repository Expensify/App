import React from 'react';
import RNFS from 'react-native-fs';
import BaseProfilingToolMenu from './BaseProfilingToolMenu';

function ProfilingToolMenu() {
    return (
        <BaseProfilingToolMenu
            pathToBeUsed={RNFS.DocumentDirectoryPath}
            displayPath="/New Expensify"
        />
    );
}

ProfilingToolMenu.displayName = 'ProfilingToolMenu';

export default ProfilingToolMenu;
