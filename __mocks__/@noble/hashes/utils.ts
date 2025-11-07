function utf8ToBytes(str: string): Uint8Array {
    if (typeof str !== 'string') {
        throw new Error('string expected');
    }
    return new Uint8Array(new TextEncoder().encode(str));
}

// eslint-disable-next-line import/prefer-default-export
export {utf8ToBytes};
