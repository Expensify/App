import {accountIDSelector} from '@selectors/Session';
import {useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import type {ReservationData} from '@libs/TripReservationUtils';
import {getReservationsFromTripReport} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useTripRoomReports from './useTripRoomReports';

type UpcomingReservation = ReservationData & {
    reportID: string;
};

function useUpcomingTravelReservations(): UpcomingReservation[] {
    const tripRoomReports = useTripRoomReports();
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    return useMemo(() => {
        const now = new Date();
        const windowEnd = new Date(now);
        windowEnd.setDate(windowEnd.getDate() + CONST.UPCOMING_TRAVEL_WINDOW_DAYS);

        const upcoming: UpcomingReservation[] = [];

        for (const report of tripRoomReports) {
            // Only include reservations where the current user is the traveler
            if (report.ownerAccountID !== accountID) {
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
    }, [tripRoomReports, accountID]);
}

export default useUpcomingTravelReservations;
export type {UpcomingReservation};
