import CONST from '@src/CONST';
import * as ExportOnyxState from './common';

const readFromOnyxDatabase = () =>
    new Promise<Record<string, unknown>>((resolve) => {
        let db: IDBDatabase;
        const openRequest = indexedDB.open(CONST.DEFAULT_DB_NAME);
        openRequest.onsuccess = () => {
            db = openRequest.result;
            const transaction = db.transaction(CONST.DEFAULT_TABLE_NAME);
            const objectStore = transaction.objectStore(CONST.DEFAULT_TABLE_NAME);
            const cursor = objectStore.openCursor();

            const queryResult: Record<string, unknown> = {};

            cursor.onerror = () => {
                console.error('Error reading cursor');
            };

            cursor.onsuccess = (event) => {
                const {result} = event.target as IDBRequest<IDBCursorWithValue>;
                if (result) {
                    queryResult[result.primaryKey as string] = result.value;
                    result.continue();
                } else {
                    // no results mean the cursor has reached the end of the data
                    resolve(queryResult);
                }
            };
        };
    });

const shareAsFile = (value: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`);
    element.setAttribute('download', CONST.DEFAULT_ONYX_DUMP_FILE_NAME);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

export default {
    maskOnyxState: ExportOnyxState.maskOnyxState,
    readFromOnyxDatabase,
    shareAsFile,
};
