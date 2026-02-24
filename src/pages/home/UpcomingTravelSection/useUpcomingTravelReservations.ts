import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {isTripRoom} from '@libs/ReportUtils';
import type {ReservationData} from '@libs/TripReservationUtils';
import {getReservationsFromTripReport} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type UpcomingReservation = ReservationData & {
    reportID: string;
};

function useUpcomingTravelReservations(): UpcomingReservation[] {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    return useMemo(() => {
        const now = new Date();
        const windowEnd = new Date(now);
        windowEnd.setDate(windowEnd.getDate() + CONST.UPCOMING_TRAVEL_WINDOW_DAYS);

        const reports = Object.values(allReports ?? {});
        const upcoming: UpcomingReservation[] = [];

        for (const report of reports) {
            if (!report || !isTripRoom(report)) {
                continue;
            }
            const reservations = getReservationsFromTripReport(report);
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
    }, [allReports]);
}

export default useUpcomingTravelReservations;
export type {UpcomingReservation};
