import Log from '@libs/Log';

import RNFS from 'react-native-fs';

/**
 * Older app versions staged CSV/report exports in Documents/Expensify before handing them to the
 * iOS share sheet, and cancelling the sheet leaked the staged file. Exports are internal files
 * (current versions stage them in Caches), so the whole staging directory is removed.
 */
export default function removeStaleExportStagingDir(): Promise<void> {
    const stagingDir = `${RNFS.DocumentDirectoryPath}/Expensify`;
    return RNFS.exists(stagingDir).then((exists) => {
        if (!exists) {
            return;
        }
        return RNFS.unlink(stagingDir).then(() => {
            Log.info('[Migrate Onyx] MoveFilesOutOfDocuments removed the old export staging directory');
        });
    });
}
