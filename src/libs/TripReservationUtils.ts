import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type {AirPnr, CarPnr, HotelPnr, LimoPnr, MiscPnr, RailPnr, TripData} from '@src/types/onyx/TripData';
import type IconAsset from '@src/types/utils/IconAsset';

function getTripReservationIcon(reservationType?: ReservationType): IconAsset {
    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return Expensicons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        case CONST.RESERVATION_TYPE.CAR:
            return Expensicons.CarWithKey;
        case CONST.RESERVATION_TYPE.TRAIN:
            return Expensicons.Train;
        default:
            return Expensicons.Luggage;
    }
}

type ReservationData = {reservation: Reservation; transactionID: string; reportID: string | undefined; reservationIndex: number};

function getReservationsFromTripTransactions(transactions: Transaction[]): ReservationData[] {
    return transactions
        .flatMap(
            (item) =>
                item?.receipt?.reservationList?.map((reservation, reservationIndex) => ({
                    reservation,
                    transactionID: item.transactionID,
                    reportID: item.reportID,
                    reservationIndex,
                })) ?? [],
        )
        .sort((a, b) => new Date(a.reservation.start.date).getTime() - new Date(b.reservation.start.date).getTime());
}

function getTripEReceiptIcon(transaction?: Transaction): IconAsset | undefined {
    const reservationType = transaction ? transaction.receipt?.reservationList?.[0]?.type : '';

    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
        case CONST.RESERVATION_TYPE.CAR:
            return Expensicons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        default:
            return undefined;
    }
}

/**
 * Extracts the confirmation code from a reservation
 */
function getTripReservationCode(reservation: Reservation): string {
    return `${reservation.confirmations && reservation.confirmations?.length > 0 ? `${reservation.confirmations.at(0)?.value} • ` : ''}`;
}

function getReservationsFromSpotnanaPayload(tripData?: TripData): ReservationData[] {
    return [];
}

function getReservationsFromTrip(tripData?: TripData, transactions?: Transaction[]): ReservationData[] {
    if (tripData) {
        return getReservationsFromSpotnanaPayload(tripData);
    }
    if (transactions) {
        return getReservationsFromTripTransactions(transactions);
    }
    return [];
}

export {getTripReservationIcon, getTripEReceiptIcon, getTripReservationCode, getReservationsFromTrip};
export type {ReservationData};
