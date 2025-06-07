import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import {useOnyx} from 'react-native-onyx';
import Share from 'react-native-share';
import ExportOnyxState from '@libs/ExportOnyxState';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const [shouldMaskOnyxState = true] = useOnyx(ONYXKEYS.SHOULD_MASK_ONYX_STATE, {canBeMissing: true});
    const zipRef = useRef(new JSZip());

    const createAndSaveFile = (logs: Log[]) => {
        const newFileName = appendTimeToFileName('logs.txt');
        const zipFileName = 'troubleshoot.zip';
        const dir = RNFetchBlob.fs.dirs.DocumentDir;
        const zipPath = `${dir}/${zipFileName}`;
        const tempZipPath = `${RNFetchBlob.fs.dirs.CacheDir}/${zipFileName}-temp`;

        zipRef.current.file(newFileName, JSON.stringify(logs, null, 2));

        return ExportOnyxState.readFromOnyxDatabase()
            .then((value: Record<string, unknown>) => {
                const dataToShare = JSON.stringify(ExportOnyxState.maskOnyxState(value, shouldMaskOnyxState));
                return zipRef.current.file(CONST.DEFAULT_ONYX_DUMP_FILE_NAME, dataToShare);
            })
            .then(() => {
                return zipRef.current
                    .generateAsync({type: 'base64'}) // Generate ZIP as base64
                    .then((base64zip) => {
                        // Save zip archive to a temporary path (this is reaquired because of Android 10+ limitations)
                        return RNFetchBlob.fs.writeFile(tempZipPath, base64zip, 'base64');
                    })
                    .then(() => {
                        // Copy the zip archive from the temporary path to the Downloads folder
                        return RNFetchBlob.MediaCollection.copyToMediaStore(
                            {
                                name: zipFileName,
                                parentFolder: '',
                                mimeType: 'application/zip',
                            },
                            'Download',
                            tempZipPath,
                        ).then(() => {
                            return RNFetchBlob.fs.stat(zipPath).then(({size}) => ({
                                path: zipPath,
                                newFileName: zipFileName,
                                size,
                            }));
                        });
                    })
                    .then((localZipFile) => {
                        return setFile(localZipFile); // Update state or use the file path
                    })
                    .catch((err) => {
                        console.error('Failed to write ZIP file:', err);
                    });
            });
    };

    const onDownloadZip = () => {
        if (!file) {
            return;
        }
        Share.open({
            url: `file://${file.path}`,
        });
    };

    return (
        <BaseRecordTroubleshootDataToolMenu
            file={file}
            onEnableLogging={() => setFile(undefined)}
            onDisableLogging={createAndSaveFile}
            pathToBeUsed={RNFS.DownloadDirectoryPath}
            displayPath2={`${CONST.DOWNLOADS_PATH}`}
            showShareButton
            onDownloadZip={onDownloadZip}
            zipRef={zipRef}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
