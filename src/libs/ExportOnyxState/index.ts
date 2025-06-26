import CONST from '@src/CONST';
import type OnyxState from '@src/types/onyx/OnyxState';
import {maskOnyxState} from './common';
import type {ExportOnyxStateModule, ReadFromOnyxDatabase, ShareAsFile} from './types';

const readFromOnyxDatabase: ReadFromOnyxDatabase = () =>
    new Promise((resolve) => {
        let db: IDBDatabase;
        const openRequest = indexedDB.open(CONST.DEFAULT_DB_NAME);
        openRequest.onsuccess = () => {
            db = openRequest.result;
            const transaction = db.transaction(CONST.DEFAULT_TABLE_NAME);
            const objectStore = transaction.objectStore(CONST.DEFAULT_TABLE_NAME);
            const cursor = objectStore.openCursor();

            const queryResult: OnyxState = {};

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

const shareAsFile: ShareAsFile = (fileContent) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(fileContent)}`);
    element.setAttribute('download', CONST.DEFAULT_ONYX_DUMP_FILE_NAME);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

const ExportOnyxState: ExportOnyxStateModule = {
    maskOnyxState,
    readFromOnyxDatabase,
    shareAsFile,
};

export default ExportOnyxState;
