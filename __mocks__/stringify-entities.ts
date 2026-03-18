// CJS mock for stringify-entities (ESM-only package incompatible with Jest)
function stringifyEntities(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stringifyEntitiesLight(value: string): string {
    return stringifyEntities(value);
}

export {stringifyEntities, stringifyEntitiesLight};
