import RNFS from 'react-native-fs';
import {open} from 'react-native-nitro-sqlite';
import type {OnyxSQLiteKeyValuePair} from 'react-native-onyx';
import Share from 'react-native-share';
import CONST from '@src/CONST';
import type OnyxState from '@src/types/onyx/OnyxState';
import {maskOnyxState} from './common';
import type {ExportOnyxStateModule, ReadFromOnyxDatabase, ShareAsFile} from './types';

let onyxDb: ReturnType<typeof open> | null = null;

function getOnyxDb() {
    if (!onyxDb) {
        onyxDb = open({name: CONST.DEFAULT_DB_NAME});
    }
    return onyxDb;
}

const readFromOnyxDatabase: ReadFromOnyxDatabase = () =>
    new Promise((resolve) => {
        const db = getOnyxDb();
        const query = `SELECT * FROM ${CONST.DEFAULT_TABLE_NAME}`;

        db.executeAsync<OnyxSQLiteKeyValuePair>(query, []).then(({rows}) => {
            const result =
                // eslint-disable-next-line no-underscore-dangle
                rows?._array.reduce<OnyxState>((acc, row) => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    acc[row?.record_key] = JSON.parse(row?.valueJSON) as unknown;
                    return acc;
                }, {}) ?? {};
            resolve(result);
        });
    });

const shareAsFile: ShareAsFile = (fileContent) => {
    try {
        // Define new filename and path for the app info file
        const infoFileName = CONST.DEFAULT_ONYX_DUMP_FILE_NAME;
        const infoFilePath = `${RNFS.DocumentDirectoryPath}/${infoFileName}`;
        const actualInfoFile = `file://${infoFilePath}`;

        RNFS.writeFile(infoFilePath, fileContent, 'utf8').then(() => {
            Share.open({
                url: actualInfoFile,
                failOnCancel: false,
            });
        });
    } catch (error) {
        console.error('Error renaming and sharing file:', error);
    }
};

const ExportOnyxState: ExportOnyxStateModule = {
    maskOnyxState,
    readFromOnyxDatabase,
    shareAsFile,
};

export default ExportOnyxState;
