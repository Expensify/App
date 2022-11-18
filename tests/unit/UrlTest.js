const Url = require('../../src/libs/Url');

describe('Url', () => {
    describe('getURLObject()', () => {
        it('It should work correctly', () => {
            expect(Url.getURLObject('https://new.expensify.com/inbox/124')).toEqual({
                href: 'https://new.expensify.com/inbox/124',
                host: 'new.expensify.com',
                hostname: 'new.expensify.com',
                path: '/inbox/124',
                port: undefined,
                protocol: 'https:',
            });
        });
    });
    describe('hasSameOrigin()', () => {
        describe('happy path', () => {
            it('It should work correctly', () => {
                expect(Url.hasSameOrigin('https://new.expensify.com/inbox/124', 'https://new.expensify.com/inbox/123')).toBe(true);
            });
            it('It should work correctly with www in both urls', () => {
                expect(Url.hasSameOrigin('https://www.new.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with www in a url', () => {
                expect(Url.hasSameOrigin('https://new.expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
        });
        describe('failure path', () => {
            it('It should work correctly with two origin url', () => {
                expect(Url.hasSameOrigin('https://new.expensify.com/inbox/124', 'https://expensify.com/inbox/123')).toBe(false);
            });
            it('It should work correctly with www', () => {
                expect(Url.hasSameOrigin('https://www.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
            it('It should work correctly with  www', () => {
                expect(Url.hasSameOrigin('https://expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
        });
    });
});
