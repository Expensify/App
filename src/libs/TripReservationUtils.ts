import type {Dispatch, SetStateAction} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {TravelSettings} from '@src/types/onyx';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import * as Link from './actions/Link';
import Navigation from './Navigation/Navigation';

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

function bookATrip(
    translate: LocaleContextProps['translate'],
    travelSettings: OnyxEntry<TravelSettings>,
    activePolicyID: string,
    setCtaErrorMessage: Dispatch<SetStateAction<string>>,
    ctaErrorMessage = '',
): void {
    if (isEmptyObject(travelSettings)) {
        Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(activePolicyID ?? '-1', Navigation.getActiveRoute()));
        return;
    }
    if (!travelSettings?.hasAcceptedTerms) {
        Navigation.navigate(ROUTES.TRAVEL_TCS);
        return;
    }
    if (ctaErrorMessage) {
        setCtaErrorMessage('');
    }
    Link.openTravelDotLink(activePolicyID)?.catch(() => {
        setCtaErrorMessage(translate('travel.errorMessage'));
    });
}
export {getTripReservationIcon, getReservationsFromTripTransactions, getTripEReceiptIcon, bookATrip};
