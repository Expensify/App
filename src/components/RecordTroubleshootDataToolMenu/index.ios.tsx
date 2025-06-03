import JSZip from 'jszip';
import React, {useRef, useState} from 'react';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import useEnvironment from '@hooks/useEnvironment';
import {appendTimeToFileName} from '@libs/fileDownload/FileUtils';
import getDownloadFolderPathSuffixForIOS from '@libs/getDownloadFolderPathSuffixForIOS';
import CONST from '@src/CONST';
import type {Log} from '@src/types/onyx';
import BaseRecordTroubleshootDataToolMenu from './BaseRecordTroubleshootDataToolMenu';

function RecordTroubleshootDataToolMenu() {
    const [file, setFile] = useState<{path: string; newFileName: string; size: number}>();
    const {environment} = useEnvironment();

    const zipRef = useRef(new JSZip());

    const createFile = (logs: Log[]) => {
        const newFileName = appendTimeToFileName('logs.txt');

        zipRef.current.file(newFileName, JSON.stringify(logs, null, 2));

        const dir = RNFetchBlob.fs.dirs.DocumentDir;
        const zipFileName = 'troubleshoot.zip';

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
            onDisableLogging={createFile}
            pathToBeUsed={RNFS.DocumentDirectoryPath}
            displayPath2={`${CONST.NEW_EXPENSIFY_PATH}${getDownloadFolderPathSuffixForIOS(environment)}`}
            showShareButton
            onDownloadZip={onDownloadZip}
            zipRef={zipRef}
        />
    );
}

export default RecordTroubleshootDataToolMenu;
