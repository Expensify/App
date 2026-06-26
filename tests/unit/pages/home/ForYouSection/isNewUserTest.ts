import isNewUser from '@pages/home/ForYouSection/isNewUser';

const CUTOFF = '2026-06-24';

describe('isNewUser', () => {
    it('classifies a user who onboarded on the cutoff date as new', () => {
        expect(isNewUser('2026-06-24', CUTOFF)).toBe(true);
    });

    it('classifies a user who onboarded after the cutoff date as new', () => {
        expect(isNewUser('2026-07-01', CUTOFF)).toBe(true);
    });

    it('classifies a user who onboarded before the cutoff date as old', () => {
        expect(isNewUser('2026-01-01', CUTOFF)).toBe(false);
    });

    it('treats a missing trial start date as an old user', () => {
        expect(isNewUser(undefined, CUTOFF)).toBe(false);
    });

    it('treats an unparseable trial start date as an old user', () => {
        expect(isNewUser('not-a-date', CUTOFF)).toBe(false);
    });
});
