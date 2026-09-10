import useOnyx from '@hooks/useOnyx';

import type {ReservationData} from '@libs/TripReservationUtils';
import {getReservationsFromTripReport} from '@libs/TripReservationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';

import {emailSelector} from '@selectors/Session';
import {useMemo} from 'react';

import useTripRoomReports from './useTripRoomReports';

type UpcomingReservation = ReservationData & {
    reportID: string;
};

function isCurrentUserTraveler(reportNameValuePairs: Pick<ReportNameValuePairs, 'tripData'> | undefined, currentUserEmail: string): boolean {
    return reportNameValuePairs?.tripData?.payload?.pnrs.some((pnr) => pnr.data.travelers.some((traveler) => traveler.user.email === currentUserEmail)) ?? false;
}

function useUpcomingTravelReservations(): UpcomingReservation[] {
    const tripRoomReports = useTripRoomReports();
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    return useMemo(() => {
        if (!currentUserEmail) {
            return [];
        }

        const now = new Date();
        const windowEnd = new Date(now);
        windowEnd.setDate(windowEnd.getDate() + CONST.UPCOMING_TRAVEL_WINDOW_DAYS);

        const upcoming: UpcomingReservation[] = [];

        for (const report of tripRoomReports) {
            const tripReportNameValuePairs = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`];
            if (!isCurrentUserTraveler(tripReportNameValuePairs, currentUserEmail)) {
                continue;
            }
            const reservations = getReservationsFromTripReport(report, tripReportNameValuePairs);
            for (const resData of reservations) {
                const startDate = new Date(resData.reservation.start.date);
                if (Number.isNaN(startDate.getTime())) {
                    continue;
                }
                if (startDate >= now && startDate <= windowEnd) {
                    upcoming.push({...resData, reportID: report.reportID});
                }
            }
        }

        return upcoming.sort((a, b) => new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime());
    }, [tripRoomReports, currentUserEmail, reportNameValuePairs]);
}

export default useUpcomingTravelReservations;
export type {UpcomingReservation};
