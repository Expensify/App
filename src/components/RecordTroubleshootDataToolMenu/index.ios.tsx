import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useEnvironment from '@hooks/useEnvironment';
import useOnyx from '@hooks/useOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import getDownloadFolderPathSuffixForIOS from '@libs/getDownloadFolderPathSuffixForIOS';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const {environment} = useEnvironment();
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE, {canBeMissing: true});

    const zipRef = useRef(new JSZip());

    const createFile = () => {
        const dir = RNFetchBlob.fs.dirs.DocumentDir;
        const zipFileName = appendTimeToFileName('troubleshoot.zip');

        return ExportOnyxState.readFromOnyxDatabase()
            .then((value: Record<string, unknown>) => {
                const dataToShare = JSON.stringify(ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState));
                return zipRef.current.file(CONST.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
            })
            .then(() => {
                return zipRef.current
                    .generateAsync({type: 'base64'})
                    .then((base64zip) => {
                        const zipPath = `${dir}/${zipFileName}`;
                        return RNFetchBlob.fs.writeFile(zipPath, base64zip, 'base64').then(() => {
                            return RNFetchBlob.fs.stat(zipPath).then(({size}) => ({
                                path: zipPath,
                                newFileName: zipFileName,
                                size,
                            }));
                        });
                    })
                    .then((localZipFile) => {
                        return setFile(localZipFile);
                    })
                    .catch((err) => {
                        console.error('Failed to write ZIP file:', err);
                    })
                    .finally(() => {
                        zipRef.current = new JSZip(); // Reset the zipRef for future use
                    });
            });
    };

    return (
        <BaseRecordTroubleshootDataToolMenu
            file={file}
            onEnableLogging={() => setFile(undefined)}
            onDisableRecording={createFile}
            pathToBeUsed={RNFS.DocumentDirectoryPath}
            showShareButton
            zipRef={zipRef}
            displayPath={`${CONST.NEW_EXPENSIFY_PATH}${getDownloadFolderPathSuffixForIOS(environment)}`}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
