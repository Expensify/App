import {open} from 'react-native-quick-sqlite';

const readFromIndexedDB = () => new Promise((resolve) => {
    const db = open({name: 'OnyxDB'});
    const query = 'SELECT * FROM keyvaluepairs';

    db.executeAsync(query, []).then(({rows}) => {
        // eslint-disable-next-line no-underscore-dangle
        const result = rows?._array.map((row) => ({[row.record_key]: JSON.parse(row.valueJSON as string)}));

        resolve(result);
    });

    db.close();
});

export default {
    readFromIndexedDB,
}
