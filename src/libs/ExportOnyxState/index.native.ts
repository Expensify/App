import RNFS from 'react-native-fs';
import {open} from 'react-native-quick-sqlite';
import Share from 'react-native-share';
import CONST from '@src/CONST';
import ExportOnyxState from './common';

const readFromOnyxDatabase = () =>
    new Promise((resolve) => {
        const db = open({name: CONST.DEFAULT_DB_NAME});
        const query = `SELECT * FROM ${CONST.DEFAULT_TABLE_NAME}`;

        db.executeAsync(query, []).then(({rows}) => {
            // eslint-disable-next-line no-underscore-dangle
            const result = rows?._array.reduce<Record<string, unknown>>((acc, row) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                acc[row?.record_key] = JSON.parse(row?.valueJSON as string) as unknown;
                return acc;
            }, {});
            resolve(result);
        });
    });

const shareAsFile = (value: string) => {
    try {
        // Define new filename and path for the app info file
        const infoFileName = CONST.DEFAULT_ONYX_DUMP_FILE_NAME;
        const infoFilePath = `${RNFS.DocumentDirectoryPath}/${infoFileName}`;
        const actualInfoFile = `file://${infoFilePath}`;

        RNFS.writeFile(infoFilePath, value, 'utf8').then(() => {
            Share.open({
                url: actualInfoFile,
                failOnCancel: false,
            });
        });
    } catch (error) {
        console.error('Error renaming and sharing file:', error);
    }
};

export default {
    maskOnyxState: ExportOnyxState.maskOnyxState,
    readFromOnyxDatabase,
    shareAsFile,
};
