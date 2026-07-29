import ROUTES from '@src/ROUTES';

describe('ROUTES', () => {
    describe('SEARCH_ROOT', () => {
        it.each([
            ['plain name', 'test-97161', 'test-97161'],
            ['name with URL metacharacters', 'R&D Q1#draft 100%', 'R%26D%20Q1%23draft%20100%25'],
        ])('encodes %s', (_, name, encodedName) => {
            const query = 'type:expense';
            expect(ROUTES.SEARCH_ROOT.getRoute({query, name})).toBe(`search?q=${encodeURIComponent(query)}&name=${encodedName}`);
        });
    });
});
