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
import * as Link from './actions/Link';
import Log from './Log';
import Navigation from './Navigation/Navigation';
import * as PolicyUtils from './PolicyUtils';

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

function bookATrip(translate: LocaleContextProps['translate'], setCtaErrorMessage: Dispatch<SetStateAction<string>>, ctaErrorMessage = ''): void {
    if (Str.isSMSLogin(primaryLogin)) {
        setCtaErrorMessage(translate('travel.phoneError'));
        return;
    }
    const policy = PolicyUtils.getPolicy(activePolicyID);
    if (isEmptyObject(policy?.address)) {
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
    Link.openTravelDotLink(activePolicyID)
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
}
export {getTripReservationIcon, getReservationsFromTripTransactions, getTripEReceiptIcon, bookATrip};
