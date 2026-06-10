import {convertAttendeesToArray, enrichAndSortAttendees, normalizeAttendee, normalizeAttendees} from '@libs/AttendeeUtils';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

const makeAttendee = (overrides: Partial<Attendee> = {}): Attendee => ({
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.png',
    ...overrides,
});

describe('AttendeeUtils', () => {
    describe('convertAttendeesToArray', () => {
        describe('falsy / missing values', () => {
            it('returns [] for undefined', () => {
                expect(convertAttendeesToArray(undefined)).toEqual([]);
            });

            it('returns [] for null (unexpected runtime value)', () => {
                expect(convertAttendeesToArray(null)).toEqual([]);
            });
        });

        describe('array inputs', () => {
            it('returns [] for an empty array', () => {
                expect(convertAttendeesToArray([])).toEqual([]);
            });

            it('returns the same array reference when input is already an array', () => {
                const attendees: Attendee[] = [makeAttendee({email: 'a@test.com'})];
                expect(convertAttendeesToArray(attendees)).toBe(attendees);
            });

            it('returns all items for an array with multiple attendees', () => {
                const attendees: Attendee[] = [makeAttendee({email: 'a@test.com'}), makeAttendee({email: 'b@test.com'}), makeAttendee({email: 'c@test.com'})];
                expect(convertAttendeesToArray(attendees)).toHaveLength(3);
                expect(convertAttendeesToArray(attendees)).toEqual(attendees);
            });
        });

        describe('plain-object inputs (Onyx-deserialized arrays)', () => {
            it('returns [] for an empty object {}', () => {
                expect(convertAttendeesToArray({})).toEqual([]);
            });

            it('converts a single-entry object to a one-element array', () => {
                const attendee = makeAttendee({email: 'a@test.com'});
                const result = convertAttendeesToArray({first: attendee});
                expect(result).toHaveLength(1);
                expect(result.at(0)).toBe(attendee);
            });

            it('converts a multi-entry object to an array containing all values', () => {
                const a1 = makeAttendee({email: 'a@test.com'});
                const a2 = makeAttendee({email: 'b@test.com'});
                const a3 = makeAttendee({email: 'c@test.com'});
                const result = convertAttendeesToArray({first: a1, second: a2, third: a3});
                expect(result).toHaveLength(3);
                expect(result).toContain(a1);
                expect(result).toContain(a2);
                expect(result).toContain(a3);
            });

            it('preserves all attendee fields when converting from an object', () => {
                const attendee = makeAttendee({email: 'user@test.com', displayName: 'Alice', login: 'alice', accountID: 42, selected: true});
                const result = convertAttendeesToArray({first: attendee});
                expect(result.at(0)).toMatchObject({email: 'user@test.com', displayName: 'Alice', login: 'alice', accountID: 42, selected: true});
            });
        });

        describe('non-object primitives (unexpected runtime values)', () => {
            it('returns [] for a string', () => {
                expect(convertAttendeesToArray('invalid')).toEqual([]);
            });

            it('returns [] for a number', () => {
                expect(convertAttendeesToArray(42)).toEqual([]);
            });

            it('returns [] for a boolean', () => {
                expect(convertAttendeesToArray(true)).toEqual([]);
            });
        });
    });

    describe('normalizeAttendee', () => {
        it('should trim email and omit it when blank', () => {
            const attendee: Attendee = {
                email: '   ',
                displayName: '  John Smith  ',
                avatarUrl: '',
                login: '  john@example.com  ',
            };

            const result = normalizeAttendee(attendee);

            expect(result).toEqual({
                displayName: 'John Smith',
                avatarUrl: '',
                login: 'john@example.com',
            });
        });

        it('should fall back to login when displayName and email are missing', () => {
            const attendee: Attendee = {
                displayName: '   ',
                avatarUrl: '',
                login: '  login-only@example.com  ',
            };

            const result = normalizeAttendee(attendee);

            expect(result).toEqual({
                displayName: 'login-only@example.com',
                avatarUrl: '',
                login: 'login-only@example.com',
            });
        });

        it('should use normalized email as the display name when displayName is missing', () => {
            const attendee: Attendee = {
                email: '  attendee@example.com  ',
                displayName: '   ',
                avatarUrl: '',
            };

            const result = normalizeAttendee(attendee);

            expect(result).toEqual({
                email: 'attendee@example.com',
                displayName: 'attendee@example.com',
                avatarUrl: '',
                login: undefined,
            });
        });
    });

    describe('normalizeAttendees', () => {
        it('should return an empty array when attendees are undefined', () => {
            expect(normalizeAttendees(undefined)).toEqual([]);
        });

        it('should normalize each attendee in the list', () => {
            const attendees: Attendee[] = [
                {email: '  one@example.com  ', displayName: ' One ', avatarUrl: '', login: ' one@example.com '},
                {displayName: '   ', avatarUrl: '', login: ' two@example.com '},
            ];

            expect(normalizeAttendees(attendees)).toEqual([
                {email: 'one@example.com', displayName: 'One', avatarUrl: '', login: 'one@example.com'},
                {displayName: 'two@example.com', avatarUrl: '', login: 'two@example.com'},
            ]);
        });
    });

    describe('enrichAndSortAttendees', () => {
        const localeCompare = (a: string, b: string) => a.localeCompare(b);

        it('returns input as-is when it is not an array', () => {
            expect(enrichAndSortAttendees(undefined, undefined, localeCompare)).toBeUndefined();
        });

        it('sorts alphabetically by stored displayName when no personalDetails are available', () => {
            const attendees: Attendee[] = [
                {email: 'b@x.com', displayName: 'banana', avatarUrl: '', login: 'b@x.com'},
                {email: 'a@x.com', displayName: 'apple', avatarUrl: '', login: 'a@x.com'},
            ];

            expect(enrichAndSortAttendees(attendees, undefined, localeCompare).map((a) => a.displayName)).toEqual(['apple', 'banana']);
        });

        it('enriches displayName and avatar from personalDetails when accountID matches', () => {
            const accountID = 1;
            const attendees: Attendee[] = [{accountID, displayName: 'Old', avatarUrl: 'old.png'}];
            const personalDetailsList: PersonalDetailsList = {[accountID]: {accountID, displayName: 'New', avatar: 'new.png'}};

            const result = enrichAndSortAttendees(attendees, personalDetailsList, localeCompare);

            expect(result.at(0)?.displayName).toBe('New');
            expect(result.at(0)?.avatarUrl).toBe('new.png');
        });

        it('falls back to stored value when personalDetails has empty strings', () => {
            const accountID = 1;
            const attendees: Attendee[] = [{accountID, displayName: 'Stored', avatarUrl: 'stored.png'}];
            const personalDetailsList: PersonalDetailsList = {[accountID]: {accountID, displayName: '', avatar: ''}};

            const result = enrichAndSortAttendees(attendees, personalDetailsList, localeCompare);

            expect(result.at(0)?.displayName).toBe('Stored');
            expect(result.at(0)?.avatarUrl).toBe('stored.png');
        });

        it('sorts using enriched displayName so a profile rename moves the pill', () => {
            const renamedAccountID = 1;
            const attendees: Attendee[] = [
                {accountID: renamedAccountID, displayName: 'alice', avatarUrl: ''},
                {accountID: 2, displayName: 'bob', avatarUrl: ''},
            ];
            const personalDetailsList: PersonalDetailsList = {[renamedAccountID]: {accountID: renamedAccountID, displayName: 'zoe'}};

            expect(enrichAndSortAttendees(attendees, personalDetailsList, localeCompare).map((a) => a.displayName)).toEqual(['bob', 'zoe']);
        });

        it('does not mutate the input array', () => {
            const attendees: Attendee[] = [
                {displayName: 'banana', avatarUrl: ''},
                {displayName: 'apple', avatarUrl: ''},
            ];
            const snapshot = [...attendees];

            enrichAndSortAttendees(attendees, undefined, localeCompare);

            expect(attendees).toEqual(snapshot);
        });
    });
});
