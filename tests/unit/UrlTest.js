const Url = require('../../src/libs/Url');

describe('Url', () => {
    describe('hasSameExpensifyOrigin()', () => {
        describe('happy path', () => {
            it('It should work correctly', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/inbox/124', 'https://new.expensify.com/inbox/123')).toBe(true);
            });
            it('It should work correctly with www in both urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.new.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with www in one of two urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with old dot', () => {
                expect(Url.hasSameExpensifyOrigin('https://expensify.com/action/123', 'https://www.expensify.com/action/123')).toBe(true);
            });
            it('It should work correctly with local urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.expensify.com.dev/inbox/123', 'https://expensify.com.dev/inbox/123')).toBe(true);
            });
        });
        describe('failure path', () => {
            it('It should work correctly with two origin urls', () => {
                expect(Url.hasSameExpensifyOrigin('https://new.expensify.com/inbox/124', 'https://expensify.com/inbox/123')).toBe(false);
            });
            it('It should work correctly with www', () => {
                expect(Url.hasSameExpensifyOrigin('https://www.expensify.com/inbox/124', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
            it('It should work correctly with  www', () => {
                expect(Url.hasSameExpensifyOrigin('https://expensify.com/action/1234', 'https://www.new.expensify.com/action/123')).toBe(false);
            });
        });
    });
});
