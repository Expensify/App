import {enrichAndSortAttendees, normalizeAttendee, normalizeAttendees} from '@libs/AttendeeUtils';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

describe('AttendeeUtils', () => {
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
