import {canApproveBooking, getBookingDeadlineDate, getBookingStatusBadge, getEarliestOutstandingBooking, getTripDeadlineText} from '@libs/TravelApprovalUtils';

import type {ThemeColors} from '@styles/theme/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

import {translateLocal} from '../utils/TestHelper';

const APPROVER_ACCOUNT_ID = 24680;
const OTHER_ACCOUNT_ID = 13579;
const HOTEL_PNR_ID = 'pnr-hotel-oslo-001';
const FLIGHT_PNR_ID = 'pnr-flight-oslo-2661';

// 10:00 in Oslo (UTC+1 in December)
const NOW = new Date('2026-12-10T09:00:00Z');

// One distinct color pair per status, so each assertion can tell which pair a badge got
const BADGE_COLORS: ThemeColors['reportStatusBadge'] = {
    draft: {backgroundColor: '#d1', textColor: '#d2'},
    outstanding: {backgroundColor: '#o1', textColor: '#o2'},
    approved: {backgroundColor: '#a1', textColor: '#a2'},
    paid: {backgroundColor: '#p1', textColor: '#p2'},
    closed: {backgroundColor: '#c1', textColor: '#c2'},
    deleted: {backgroundColor: '#x1', textColor: '#x2'},
    unreported: {backgroundColor: '#u1', textColor: '#u2'},
    canceled: {backgroundColor: '#k1', textColor: '#k2'},
};

function buildBooking(overrides: Partial<BookingApproval> = {}): BookingApproval {
    return {
        status: CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING,
        approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.SOFT,
        approvalID: 'approval-id',
        approverAccountIDs: [APPROVER_ACCOUNT_ID],
        deadline: {iso8601: '2026-12-10T12:00:00', zoneId: 'Europe/Oslo'},
        ...overrides,
    };
}

function buildTripData(bookings: Record<string, BookingApproval>): ReportNameValuePairs['tripData'] {
    return {tripID: 'trip-oslo-react-meetup', bookingApprovalState: bookings};
}

describe('TravelApprovalUtils', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    describe('canApproveBooking', () => {
        it('lets an approver act on an outstanding booking before its deadline', () => {
            // Given an outstanding booking the user approves, with its deadline still ahead
            const tripData = buildTripData({[HOTEL_PNR_ID]: buildBooking()});

            // When we check whether the approver can act on it
            // Then they can, since every condition for a decision holds
            expect(canApproveBooking(tripData, HOTEL_PNR_ID, APPROVER_ACCOUNT_ID, NOW)).toBe(true);
        });

        it('stops approvers once the deadline has passed', () => {
            // Given an outstanding booking whose deadline was an hour ago in its own time zone
            const tripData = buildTripData({[HOTEL_PNR_ID]: buildBooking({deadline: {iso8601: '2026-12-10T09:00:00', zoneId: 'Europe/Oslo'}})});

            // When we check whether the approver can act on it
            // Then they can't, because Spotnana has already approved or canceled it
            expect(canApproveBooking(tripData, HOTEL_PNR_ID, APPROVER_ACCOUNT_ID, NOW)).toBe(false);
        });

        it('stops users who are not approvers of the booking', () => {
            // Given an outstanding booking approved by someone else
            const tripData = buildTripData({[HOTEL_PNR_ID]: buildBooking()});

            // When another user checks whether they can act on it
            // Then they can't, since only the booking's approvers decide
            expect(canApproveBooking(tripData, HOTEL_PNR_ID, OTHER_ACCOUNT_ID, NOW)).toBe(false);
            expect(canApproveBooking(tripData, HOTEL_PNR_ID, undefined, NOW)).toBe(false);
        });

        it('stops approvers on bookings that are not outstanding', () => {
            // Given bookings that were already decided or never needed approval
            const decidedStatuses = [
                CONST.TRAVEL.BOOKING_APPROVAL.STATUS.APPROVED,
                CONST.TRAVEL.BOOKING_APPROVAL.STATUS.REJECTED,
                CONST.TRAVEL.BOOKING_APPROVAL.STATUS.CANCELED,
                CONST.TRAVEL.BOOKING_APPROVAL.STATUS.NOT_REQUIRED,
            ];

            // When the approver checks each of them
            // Then none can be acted on, since there's no decision left to make
            for (const status of decidedStatuses) {
                expect(canApproveBooking(buildTripData({[HOTEL_PNR_ID]: buildBooking({status})}), HOTEL_PNR_ID, APPROVER_ACCOUNT_ID, NOW)).toBe(false);
            }
        });

        it('stops approvers when the trip has no approval state for the booking', () => {
            // Given a trip room without approval data for this booking
            const tripData = buildTripData({[FLIGHT_PNR_ID]: buildBooking()});

            // When the approver checks the other booking
            // Then they can't act, since there's nothing to decide on
            expect(canApproveBooking(tripData, HOTEL_PNR_ID, APPROVER_ACCOUNT_ID, NOW)).toBe(false);
            expect(canApproveBooking(undefined, HOTEL_PNR_ID, APPROVER_ACCOUNT_ID, NOW)).toBe(false);
        });
    });

    describe('deadline', () => {
        it('reads the saved deadline in its own time zone', () => {
            // Given the same local deadline saved in two different time zones
            const osloBooking = buildBooking();
            const newYorkBooking = buildBooking({deadline: {iso8601: '2026-12-10T12:00:00', zoneId: 'America/New_York'}});

            // When the deadlines are read
            // Then each is noon in its own zone, so they are six hours apart
            expect(getBookingDeadlineDate(osloBooking)?.toISOString()).toBe('2026-12-10T11:00:00.000Z');
            expect(getBookingDeadlineDate(newYorkBooking)?.toISOString()).toBe('2026-12-10T17:00:00.000Z');
        });

        it('says when a soft approval auto-approves and a hard approval auto-cancels', () => {
            // Given a soft and a hard approval, each due two hours from now
            const softTrip = buildTripData({[HOTEL_PNR_ID]: buildBooking()});
            const hardTrip = buildTripData({[FLIGHT_PNR_ID]: buildBooking({approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.HARD})});

            // When the deadline line is built
            // Then it uses the copy for each approval type, with the time left until the saved deadline
            expect(getTripDeadlineText(translateLocal, softTrip, NOW)).toBe('Auto-approves in 2h 0m. Free cancellation until then.');
            expect(getTripDeadlineText(translateLocal, hardTrip, NOW)).toBe('Auto-cancels in 2h 0m if not approved.');
        });

        it('counts days and hours, not minutes, when the deadline is a day or more away', () => {
            // Given bookings due in two days and two hours, and in exactly one day
            const twoDaysTrip = buildTripData({[HOTEL_PNR_ID]: buildBooking({deadline: {iso8601: '2026-12-12T12:00:00', zoneId: 'Europe/Oslo'}})});
            const oneDayTrip = buildTripData({[HOTEL_PNR_ID]: buildBooking({deadline: {iso8601: '2026-12-11T10:00:00', zoneId: 'Europe/Oslo'}})});

            // When the deadline line is built
            // Then it reads in days, since "50h 0m" is hard to take in at a glance
            expect(getTripDeadlineText(translateLocal, twoDaysTrip, NOW)).toBe('Auto-approves in 2 days 2 hours. Free cancellation until then.');
            expect(getTripDeadlineText(translateLocal, oneDayTrip, NOW)).toBe('Auto-approves in 1 day. Free cancellation until then.');
        });

        it('shows the earliest deadline when several bookings are outstanding', () => {
            // Given a hotel due in two hours and a flight due in thirty minutes
            const flight = buildBooking({approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.HARD, deadline: {iso8601: '2026-12-10T10:30:00', zoneId: 'Europe/Oslo'}});
            const tripData = buildTripData({[HOTEL_PNR_ID]: buildBooking(), [FLIGHT_PNR_ID]: flight});

            // When the trip's deadline is read
            // Then the flight's comes first, so the trip shows its line
            expect(getEarliestOutstandingBooking(tripData, NOW)).toBe(flight);
            expect(getTripDeadlineText(translateLocal, tripData, NOW)).toBe('Auto-cancels in 30m if not approved.');
        });

        it('shows no deadline once it has passed or the booking is decided', () => {
            // Given a booking whose deadline has passed and one that was approved
            const passedTrip = buildTripData({[HOTEL_PNR_ID]: buildBooking({deadline: {iso8601: '2026-12-10T09:00:00', zoneId: 'Europe/Oslo'}})});
            const approvedTrip = buildTripData({[HOTEL_PNR_ID]: buildBooking({status: CONST.TRAVEL.BOOKING_APPROVAL.STATUS.APPROVED})});

            // When the deadline line is built
            // Then there's nothing to count down to
            expect(getTripDeadlineText(translateLocal, passedTrip, NOW)).toBeUndefined();
            expect(getTripDeadlineText(translateLocal, approvedTrip, NOW)).toBeUndefined();
        });
    });

    describe('getBookingStatusBadge', () => {
        it('colors each decision like the report statuses, with its own color for canceled', () => {
            // Given bookings in each status that shows a badge
            const {STATUS} = CONST.TRAVEL.BOOKING_APPROVAL;

            // When their badges are built
            // Then outstanding and approved reuse the report colors, rejected uses closed and canceled its new color
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, buildBooking({status: STATUS.OUTSTANDING}))).toEqual({text: 'Outstanding', ...BADGE_COLORS.outstanding});
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, buildBooking({status: STATUS.APPROVED}))).toEqual({text: 'Approved', ...BADGE_COLORS.approved});
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, buildBooking({status: STATUS.REJECTED}))).toEqual({text: 'Rejected', ...BADGE_COLORS.closed});
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, buildBooking({status: STATUS.CANCELED}))).toEqual({text: 'Canceled', ...BADGE_COLORS.canceled});
        });

        it('shows no badge for bookings that never needed approval', () => {
            // Given a booking that didn't need approval and one with a passive approval
            const skippedApproval = buildBooking({status: CONST.TRAVEL.BOOKING_APPROVAL.STATUS.NOT_REQUIRED});
            const passive = buildBooking({approvalType: CONST.TRAVEL.BOOKING_APPROVAL.TYPE.PASSIVE});

            // When their badges are built
            // Then neither shows one, since there's no approval for the traveler to follow
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, skippedApproval)).toBeUndefined();
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, passive)).toBeUndefined();
        });

        it('shows no badge for a status it does not know', () => {
            // Given a booking whose status is outside the known ones, like a new status from Spotnana
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Onyx can hold a status the type doesn't list yet
            const unknownStatus = buildBooking({status: 'onHold' as unknown as BookingApproval['status']});

            // When its badge is built
            // Then no badge shows, so the trip row renders instead of crashing on missing colors
            expect(getBookingStatusBadge(translateLocal, BADGE_COLORS, unknownStatus)).toBeUndefined();
        });
    });
});
