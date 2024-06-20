import type {EReceiptColorName} from '@styles/utils/types';
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

type TripEReceiptData = {
    /** Icon asset associated with the type of trip reservation */
    tripIcon?: IconAsset;

    /** EReceipt background color associated with the type of trip reservation */
    tripBGColor?: EReceiptColorName;
};

function getTripEReceiptData(transaction?: Transaction): TripEReceiptData {
    const reservationType = transaction ? transaction.receipt?.reservationList?.[0]?.type : '';

    switch (reservationType) {
        case CONST.RESERVATION_TYPE.FLIGHT:
        case CONST.RESERVATION_TYPE.CAR:
            return {tripIcon: Expensicons.Plane, tripBGColor: CONST.ERECEIPT_COLORS.PINK};
        case CONST.RESERVATION_TYPE.HOTEL:
            return {tripIcon: Expensicons.Bed, tripBGColor: CONST.ERECEIPT_COLORS.YELLOW};
        default:
            return {};
    }
}

export {getTripReservationIcon, getReservationsFromTripTransactions, getTripEReceiptData};
