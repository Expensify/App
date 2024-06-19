import RNFS from 'react-native-fs';
import {open} from 'react-native-quick-sqlite';
import Share from 'react-native-share';
import common from './common';

const readFromOnyxDatabase = () =>
    new Promise((resolve) => {
        const db = open({name: 'OnyxDB'});
        const query = 'SELECT * FROM keyvaluepairs';

        db.executeAsync(query, []).then(({rows}) => {
            // eslint-disable-next-line no-underscore-dangle
            const result = rows?._array.map((row) => ({[row.record_key]: JSON.parse(row.valueJSON as string)}));

            resolve(result);
        });
    });

// eslint-disable-next-line @lwc/lwc/no-async-await
const shareAsFile = async (value: string) => {
    try {
        // Define new filename and path for the app info file
        const infoFileName = `onyx-state.txt`;
        const infoFilePath = `${RNFS.DocumentDirectoryPath}/${infoFileName}`;
        const actualInfoFile = `file://${infoFilePath}`;

        await RNFS.writeFile(infoFilePath, value, 'utf8');

        const shareOptions = {
            urls: [actualInfoFile],
        };

        Share.open(shareOptions);
    } catch (error) {
        console.error('Error renaming and sharing file:', error);
    }
};

export default {
    maskFragileData: common.maskFragileData,
    readFromOnyxDatabase,
    shareAsFile,
};
