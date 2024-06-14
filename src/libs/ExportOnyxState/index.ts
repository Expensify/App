const readFromIndexedDB = () => new Promise((resolve) => {
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
        }

        cursor.onsuccess = (event) => {
            const { result } = event.target as IDBRequest<IDBCursorWithValue>;
            if (result) {
                queryResult[result.primaryKey as string] = result.value;
                result.continue();
            }
            else {
                resolve(queryResult);
            }
        }
    };
});

// eslint-disable-next-line @lwc/lwc/no-async-await,@typescript-eslint/require-await
const shareAsFile = async (value: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${  encodeURIComponent(value)}`);
    element.setAttribute('download', 'onyx-state.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export default {
    readFromIndexedDB,
    shareAsFile,
}
