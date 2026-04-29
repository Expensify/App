import {normalizeAttendee, normalizeAttendees} from '@libs/AttendeeUtils';
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
});
