import testReportKeys from '@src/types/utils/whitelistedReportKeys';

jest.mock('@components/ConfirmedRoute.tsx');

// This test is mainly to avoid that the testReportKeys is not removed or changed to false
describe('whitelistedReportKeys', () => {
    it('testReportKeys must be true', () => {
        expect(testReportKeys).toBe(true);
    });
});
