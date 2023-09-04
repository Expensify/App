function lastItem(object: Record<string, unknown> = {}) {
    const lastKey = Object.keys(object).pop() ?? 0;
    return object[lastKey];
}

function extractCollectionItemID(key: string) {
    return key.split('_')[1];
}

export {lastItem, extractCollectionItemID};
