import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {isTripRoom} from '@libs/ReportUtils';
import type {ReservationData} from '@libs/TripReservationUtils';
import {getReservationsFromTripReport} from '@libs/TripReservationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';

type UpcomingReservation = ReservationData & {
    reportID: string;
};

const tripRoomSelector = (report: OnyxEntry<Report>): Report | undefined => {
    if (!report || !isTripRoom(report)) {
        return;
    }
    return report;
};

const allTripRoomsSelector = (reports: OnyxCollection<Report>) => mapOnyxCollectionItems(reports, tripRoomSelector);

function useUpcomingTravelReservations(): UpcomingReservation[] {
    const [tripRoomReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: allTripRoomsSelector});

    return useMemo(() => {
        const now = new Date();
        const windowEnd = new Date(now);
        windowEnd.setDate(windowEnd.getDate() + CONST.UPCOMING_TRAVEL_WINDOW_DAYS);

        const reports = Object.values(tripRoomReports ?? {});
        const upcoming: UpcomingReservation[] = [];

        for (const report of reports) {
            if (!report) {
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
    }, [tripRoomReports]);
}

export default useUpcomingTravelReservations;
export type {UpcomingReservation};
