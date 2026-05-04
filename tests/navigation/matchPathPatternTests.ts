import matchPathPattern from '@libs/Navigation/helpers/dynamicRoutesUtils/matchPathPattern';

describe('matchPathPattern', () => {
    it('should match identical static single-segment strings', () => {
        expect(matchPathPattern('verify-account', 'verify-account')).toEqual({params: {}});
    });

    it('should match identical static multi-segment strings', () => {
        expect(matchPathPattern('add-bank-account/verify-account', 'add-bank-account/verify-account')).toEqual({params: {}});
    });

    it('should return undefined for mismatched static strings', () => {
        expect(matchPathPattern('verify-account', 'other-page')).toBeUndefined();
    });

    it('should match single param pattern and extract value', () => {
        expect(matchPathPattern('123', ':reportID')).toEqual({params: {reportID: '123'}});
    });

    it('should match pattern with static prefix + single param', () => {
        expect(matchPathPattern('flag/abc', 'flag/:reportActionID')).toEqual({params: {reportActionID: 'abc'}});
    });

    it('should match pattern with static prefix + param + static suffix', () => {
        expect(matchPathPattern('members/456/edit', 'members/:accountID/edit')).toEqual({params: {accountID: '456'}});
    });

    it('should match pattern with two params', () => {
        expect(matchPathPattern('flag/123/abc', 'flag/:reportID/:reportActionID')).toEqual({
            params: {reportID: '123', reportActionID: 'abc'},
        });
    });

    it('should match pattern with three params', () => {
        expect(matchPathPattern('a/1/b/2/c/3', 'a/:p1/b/:p2/c/:p3')).toEqual({
            params: {p1: '1', p2: '2', p3: '3'},
        });
    });

    it('should match pattern with consecutive params (no static separators)', () => {
        expect(matchPathPattern('123/abc/xyz', ':a/:b/:c')).toEqual({
            params: {a: '123', b: 'abc', c: 'xyz'},
        });
    });

    it('should return undefined when candidate has more segments than pattern', () => {
        expect(matchPathPattern('flag/123/abc/extra', 'flag/:reportID/:reportActionID')).toBeUndefined();
    });

    it('should return undefined when candidate has fewer segments than pattern', () => {
        expect(matchPathPattern('flag/123', 'flag/:reportID/:reportActionID')).toBeUndefined();
    });

    it('should return undefined for empty candidate against non-empty pattern', () => {
        expect(matchPathPattern('', 'flag/:id')).toBeUndefined();
    });

    it('should return undefined for non-empty candidate against empty pattern', () => {
        expect(matchPathPattern('flag/123', '')).toBeUndefined();
    });

    it('should return undefined when static segment does not match', () => {
        expect(matchPathPattern('other/123/abc', 'flag/:reportID/:reportActionID')).toBeUndefined();
    });

    it('should return undefined when middle static segment does not match', () => {
        expect(matchPathPattern('a/123/c/456', 'a/:p1/b/:p2')).toBeUndefined();
    });

    it('should decode URI-encoded param values', () => {
        expect(matchPathPattern('flag/hello%20world', 'flag/:name')).toEqual({
            params: {name: 'hello world'},
        });
    });

    it('should match two empty strings', () => {
        expect(matchPathPattern('', '')).toEqual({params: {}});
    });

    it('should handle leading/trailing slashes in candidate', () => {
        expect(matchPathPattern('/flag/123/', 'flag/:id')).toEqual({params: {id: '123'}});
    });
});
