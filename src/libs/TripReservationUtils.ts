import {Str} from 'expensify-common';
import type {Dispatch, SetStateAction} from 'react';
import {NativeModules} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TravelSettings} from '@src/types/onyx';
import type {Reservation, ReservationType} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import {openTravelDotLink} from './actions/Link';
import Log from './Log';
import Navigation from './Navigation/Navigation';
import {getAdminsPrivateEmailDomains, getPolicy} from './PolicyUtils';

let travelSettings: OnyxEntry<TravelSettings>;
Onyx.connect({
    key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
    callback: (val) => {
        travelSettings = val;
    },
});

let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (val) => {
        activePolicyID = val;
    },
});

let primaryLogin: string;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    callback: (val) => {
        primaryLogin = val?.primaryLogin ?? '';
    },
});

let isSingleNewDotEntry: boolean | undefined;
Onyx.connect({
    key: ONYXKEYS.IS_SINGLE_NEW_DOT_ENTRY,
    callback: (val) => {
        isSingleNewDotEntry = val;
    },
});

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

function bookATrip(translate: LocaleContextProps['translate'], setCtaErrorMessage: Dispatch<SetStateAction<string>>, ctaErrorMessage = ''): void {
    if (!activePolicyID) {
        return;
    }
    if (Str.isSMSLogin(primaryLogin)) {
        setCtaErrorMessage(translate('travel.phoneError'));
        return;
    }
    const policy = getPolicy(activePolicyID);
    if (isEmptyObject(policy?.address)) {
        Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(activePolicyID, Navigation.getActiveRoute()));
        Navigation.navigate(ROUTES.WORKSPACE_PROFILE_ADDRESS.getRoute(activePolicyID, Navigation.getActiveRoute()));
        return;
    }

    const isPolicyProvisioned = policy?.travelSettings?.spotnanaCompanyID ?? policy?.travelSettings?.associatedTravelDomainAccountID;
    if (policy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned)) {
        openTravelDotLink(activePolicyID)
            ?.then(() => {
                if (!NativeModules.HybridAppModule || !isSingleNewDotEntry) {
                    return;
                }

                Log.info('[HybridApp] Returning to OldDot after opening TravelDot');
                NativeModules.HybridAppModule.closeReactNativeApp(false, false);
            })
            ?.catch(() => {
                setCtaErrorMessage(translate('travel.errorMessage'));
            });
        if (ctaErrorMessage) {
            setCtaErrorMessage('');
        }
    } else if (isPolicyProvisioned) {
        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(CONST.TRAVEL.DEFAULT_DOMAIN));
    } else {
        const adminDomains = getAdminsPrivateEmailDomains(policy);
        let routeToNavigateTo;
        if (adminDomains.length === 0) {
            routeToNavigateTo = ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR;
        } else if (adminDomains.length === 1) {
            routeToNavigateTo = ROUTES.TRAVEL_TCS.getRoute(adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN);
        } else {
            routeToNavigateTo = ROUTES.TRAVEL_DOMAIN_SELECTOR;
        }
        Navigation.navigate(routeToNavigateTo);
    }
}
export {getTripReservationIcon, getReservationsFromTripTransactions, getTripEReceiptIcon, bookATrip};
export type {ReservationData};
