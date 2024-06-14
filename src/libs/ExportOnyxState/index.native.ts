import {open} from 'react-native-quick-sqlite';
import RNFS from "react-native-fs";
import Share from "react-native-share";

const readFromIndexedDB = () => new Promise((resolve) => {
    const db = open({name: 'OnyxDB'});
    const query = 'SELECT * FROM keyvaluepairs';

    db.executeAsync(query, []).then(({rows}) => {
        // eslint-disable-next-line no-underscore-dangle
        const result = rows?._array.map((row) => ({[row.record_key]: JSON.parse(row.valueJSON as string)}));

        resolve(result);
        db.close();
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

        await Share.open(shareOptions);
    } catch (error) {
        console.error('Error renaming and sharing file:', error);
    }
}

export default {
    readFromIndexedDB,
    shareAsFile,
}
