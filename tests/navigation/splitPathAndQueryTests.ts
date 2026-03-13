import splitPathAndQuery from '@libs/Navigation/helpers/splitPathAndQuery';

describe('splitPathAndQuery', () => {
    it('should split path and query', () => {
        const fullPath = '/settings/wallet?param=value';
        const [path, query] = splitPathAndQuery(fullPath);

        expect(path).toBe('/settings/wallet');
        expect(query).toBe('param=value');
    });

    it('should return undefined query when no query string', () => {
        const fullPath = '/settings/wallet';
        const [path, query] = splitPathAndQuery(fullPath);

        expect(path).toBe('/settings/wallet');
        expect(query).toBeUndefined();
    });

    it('should remove trailing slash from path', () => {
        const fullPath = '/settings/wallet/';
        const [path, query] = splitPathAndQuery(fullPath);

        expect(path).toBe('/settings/wallet');
        expect(query).toBeUndefined();
    });

    it('should keep single root slash', () => {
        const fullPath = '/';
        const [path, query] = splitPathAndQuery(fullPath);

        expect(path).toBe('/');
        expect(query).toBeUndefined();
    });

    it('should handle undefined input', () => {
        const [path, query] = splitPathAndQuery(undefined);

        expect(path).toBeUndefined();
        expect(query).toBeUndefined();
    });
});
