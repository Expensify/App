import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type IconAsset from '@src/types/utils/IconAsset';

function getTripReservationIcon(reservationType: ReservationType): IconAsset {
    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
            return Expensicons.Plane;
        case CONST.RESERVATION_TYPE.HOTEL:
            return Expensicons.Bed;
        case CONST.RESERVATION_TYPE.CAR:
            return Expensicons.CarWithKey;
        default:
            return Expensicons.Luggage;
    }
}

function getReservationsFromTripTransactions(transactions: Transaction[]): Reservation[] {
    return transactions
        .map((item) => item?.receipt?.reservationList ?? [])
        .filter((item) => item.length > 0)
        .flat();
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

export {getTripReservationIcon, getReservationsFromTripTransactions, getTripEReceiptIcon};
