import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();

    const zipRef = useRef(new JSZip());

    const createAndSaveFile = (logs: Log[]) => {
        // localFileCreate('logs', JSON.stringify(logs, null, 2)).then((localFile) => {
        //     RNFetchBlob.MediaCollection.copyToMediaStore(
        //         {
        //             name: localFile.newFileName,
        //             parentFolder: '',
        //             mimeType: 'text/plain',
        //         },
        //         'Download',
        //         localFile.path,
        //     );
        //     setFile(localFile);
        // });
        const newFileName = appendTimeToFileName('logs.txt');
        const zipFileName = 'troubleshoot.zip';
        const dir = RNFetchBlob.fs.dirs.DocumentDir;

        zipRef.current.file(newFileName, JSON.stringify(logs, null, 2));

        zipRef.current
            .generateAsync({type: 'base64'}) // Generate ZIP as base64
            .then((base64zip) => {
                const zipPath = `${dir}/${zipFileName}`;

                return RNFetchBlob.fs.writeFile(zipPath, base64zip, 'base64').then(() =>
                    RNFetchBlob.fs.stat(zipPath).then(({size}) => ({
                        path: zipPath,
                        newFileName: zipFileName,
                        size,
                    })),
                );
            })
            .then((localZipFile) => {
                setFile(localZipFile); // Update state or use the file path
            })
            .catch((err) => {
                console.error('Failed to write ZIP file:', err);
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
            displayPath={`${CONST.DOWNLOADS_PATH}/${file?.newFileName ?? ''}`}
            pathToBeUsed={RNFS.DownloadDirectoryPath}
            displayPath2={`${CONST.DOWNLOADS_PATH}`}
            showShareButton
            onDownloadZip={onDownloadZip}
            zipRef={zipRef}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
