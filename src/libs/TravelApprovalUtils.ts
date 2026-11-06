import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {Color} from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';

import CONST from '@src/CONST';
import type {BookingApproval} from '@src/types/onyx/ReportNameValuePairs';
import type ReportNameValuePairs from '@src/types/onyx/ReportNameValuePairs';

import {addDays, differenceInDays, differenceInHours} from 'date-fns';
import {fromZonedTime} from 'date-fns-tz';

import DateUtils from './DateUtils';

/** Helpers for Spotnana booking approvals in trip rooms: who can decide, the deadline line and the status badge */

type TripRoomData = ReportNameValuePairs['tripData'];

type BookingStatusBadge = {
    text: string;
    backgroundColor: Color;
    textColor: Color;
};

/** The booking's deadline as an instant, read from Spotnana's local time in the deadline's own time zone */
function getBookingDeadlineDate(booking: BookingApproval | undefined): Date | undefined {
    if (!booking?.deadline?.iso8601 || !booking.deadline.zoneId) {
        return undefined;
    }

    const deadline = fromZonedTime(booking.deadline.iso8601, booking.deadline.zoneId);
    return Number.isNaN(deadline.getTime()) ? undefined : deadline;
}

/** Whether the booking's approval deadline has passed */
function isBookingDeadlinePassed(booking: BookingApproval | undefined, now: Date = new Date()): boolean {
    const deadline = getBookingDeadlineDate(booking);
    return !!deadline && deadline.getTime() <= now.getTime();
}

/** Whether the booking still waits for a decision: it's outstanding and its deadline, if any, hasn't passed */
function isAwaitingDecision(booking: BookingApproval | undefined, now: Date): booking is BookingApproval {
    return booking?.status === CONST.TRAVEL.BOOKING_APPROVAL.STATUS.OUTSTANDING && !isBookingDeadlinePassed(booking, now);
}

/** Whether the user can approve or reject the booking: it's outstanding, its deadline hasn't passed and they're one of its approvers */
function canApproveBooking(tripData: TripRoomData, pnrID: string, accountID: number | undefined, now: Date = new Date()): boolean {
    const booking = tripData?.bookingApprovalState?.[pnrID];
    if (!accountID || !isAwaitingDecision(booking, now)) {
        return false;
    }

    return !!booking.approverAccountIDs?.includes(accountID);
}

/** The outstanding booking whose deadline comes first, which is the one trip-level places show */
function getEarliestOutstandingBooking(tripData: TripRoomData, now: Date = new Date()): BookingApproval | undefined {
    let earliestBooking: BookingApproval | undefined;
    let earliestDeadline: Date | undefined;

    for (const booking of Object.values(tripData?.bookingApprovalState ?? {})) {
        const deadline = getBookingDeadlineDate(booking);
        if (!isAwaitingDecision(booking, now) || !deadline) {
            continue;
        }

        if (!earliestDeadline || deadline.getTime() < earliestDeadline.getTime()) {
            earliestBooking = booking;
            earliestDeadline = deadline;
        }
    }

    return earliestBooking;
}

/** The time left until a deadline: days and hours when it's a day or more away, since minutes don't matter then, otherwise hours and minutes */
function getTimeLeftText(translate: LocalizedTranslate, deadline: Date, now: Date): string {
    const days = differenceInDays(deadline, now);
    if (days < 1) {
        return DateUtils.getFormattedDuration(translate, Math.floor((deadline.getTime() - now.getTime()) / 1000));
    }

    const hours = differenceInHours(deadline, addDays(now, days));
    const daysText = translate('common.durationDays', {count: days});
    return hours ? `${daysText} ${translate('common.durationHours', {count: hours})}` : daysText;
}

/** The deadline line for an outstanding booking, or undefined when it has none to show */
function getBookingDeadlineText(translate: LocalizedTranslate, booking: BookingApproval | undefined, now: Date = new Date()): string | undefined {
    const deadline = getBookingDeadlineDate(booking);
    if (!isAwaitingDecision(booking, now) || !deadline) {
        return undefined;
    }

    const timeLeft = getTimeLeftText(translate, deadline, now);

    if (booking.approvalType === CONST.TRAVEL.BOOKING_APPROVAL.TYPE.SOFT) {
        return translate('travel.approval.deadline.softApproval', timeLeft);
    }
    if (booking.approvalType === CONST.TRAVEL.BOOKING_APPROVAL.TYPE.HARD) {
        return translate('travel.approval.deadline.hardApproval', timeLeft);
    }
    return undefined;
}

/** The trip's deadline line, from the outstanding booking whose deadline comes first */
function getTripDeadlineText(translate: LocalizedTranslate, tripData: TripRoomData, now: Date = new Date()): string | undefined {
    return getBookingDeadlineText(translate, getEarliestOutstandingBooking(tripData, now), now);
}

/** The status badge for a booking, or undefined for bookings that show none (notRequired and passive approvals) */
function getBookingStatusBadge(translate: LocalizedTranslate, badgeColors: ThemeColors['reportStatusBadge'], booking: BookingApproval | undefined): BookingStatusBadge | undefined {
    if (!booking || booking.approvalType === CONST.TRAVEL.BOOKING_APPROVAL.TYPE.PASSIVE) {
        return undefined;
    }

    const {STATUS} = CONST.TRAVEL.BOOKING_APPROVAL;
    const colorsByStatus = {
        [STATUS.OUTSTANDING]: badgeColors.outstanding,
        [STATUS.APPROVED]: badgeColors.approved,
        [STATUS.REJECTED]: badgeColors.closed,
        [STATUS.CANCELED]: badgeColors.canceled,
    };

    if (booking.status === STATUS.NOT_REQUIRED) {
        return undefined;
    }

    const colors = colorsByStatus[booking.status];
    if (!colors) {
        return undefined;
    }

    return {text: translate(`travel.approval.status.${booking.status}`), backgroundColor: colors.backgroundColor, textColor: colors.textColor};
}

export {canApproveBooking, getBookingDeadlineDate, getBookingStatusBadge, getEarliestOutstandingBooking, getTripDeadlineText};
