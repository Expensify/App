import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import useOnyx from '@hooks/useOnyx';
import ExportOnyxState from '@libs/ExportOnyxState';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE, {canBeMissing: true});
    const zipRef = useRef(new JSZip());

    const createAndSaveFile = () => {
        const zipFileName = appendTimeToFileName('troubleshoot.zip');
        const tempZipPath = `${RNFetchBlob.fs.dirs.CacheDir}/${zipFileName}`;

        return ExportOnyxState.readFromOnyxDatabase()
            .then((value: Record<string, unknown>) => {
                const dataToShare = JSON.stringify(ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState));
                zipRef.current.file(CONST.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);

                return zipRef.current.generateAsync({type: 'base64'});
            })
            .then((base64zip: string) => {
                return RNFetchBlob.fs.writeFile(tempZipPath, base64zip, 'base64').then(() => {
                    return RNFetchBlob.MediaCollection.copyToMediaStore(
                        {
                            name: zipFileName,
                            // parentFolder: 'Download',
                            parentFolder: '',
                            mimeType: 'application/zip',
                        },
                        'Download',
                        tempZipPath,
                    );
                });
            })
            .then((path: string) => {
                return RNFetchBlob.fs.stat(path).then(({size, path: realPath}) => {
                    setFile({
                        path: realPath,
                        newFileName: zipFileName,
                        size,
                    });
                });
            })
            .catch((error: unknown) => {
                console.error('Failed to write ZIP file:', error);
            })
            .finally(() => {
                zipRef.current = new JSZip(); // Reset the zipRef for future use
            });
    };

    return (
        <BaseRecordTroubleshootDataToolMenu
            file={file}
            onEnableLogging={() => setFile(undefined)}
            onDisableRecording={createAndSaveFile}
            pathToBeUsed={RNFS.DownloadDirectoryPath}
            showShareButton
            zipRef={zipRef}
            displayPath={CONST.DOWNLOADS_PATH}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
