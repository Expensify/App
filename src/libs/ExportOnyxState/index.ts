import {Str} from 'expensify-common';

const readFromIndexedDB = () =>
    new Promise<Record<string, unknown>>((resolve) => {
        let db: IDBDatabase;
        const openRequest = indexedDB.open('OnyxDB', 1);
        openRequest.onsuccess = () => {
            db = openRequest.result;
            const transaction = db.transaction('keyvaluepairs');
            const objectStore = transaction.objectStore('keyvaluepairs');
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
                    resolve(queryResult);
                }
            };
        };
    });

const maskFragileData = (data: Record<string, unknown>): Record<string, unknown> => {
    const maskedData: Record<string, unknown> = {};

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (typeof value === 'string' && (Str.isValidEmail(value) || key === 'authToken' || key === 'encryptedAuthToken')) {
                maskedData[key] = '***';
            } else if (typeof value === 'object') {
                maskedData[key] = maskFragileData(value as Record<string, unknown>);
            } else {
                maskedData[key] = value;
            }
        }
    }

    return maskedData;
};

const shareAsFile = (value: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(value)}`);
    element.setAttribute('download', 'onyx-state.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
};

export default {
    maskFragileData,
    readFromIndexedDB,
    shareAsFile,
};
