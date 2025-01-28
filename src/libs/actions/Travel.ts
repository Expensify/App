import {Str} from 'expensify-common';
import type {Dispatch, SetStateAction} from 'react';
import {Linking, NativeModules} from 'react-native';
import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getAdminsPrivateEmailDomains, getPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TravelSettings} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {buildTravelDotURL, openTravelDotLink} from './Link';

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

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions
 */
function acceptSpotnanaTerms(domain?: string) {
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
                errors: getMicroSecondOnyxErrorWithTranslationKey('travel.errorMessage'),
            },
        },
    ];

    const params: AcceptSpotnanaTermsParams = {domain};

    API.write(WRITE_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, {optimisticData, successData, failureData});
}

function handleProvisioningPermissionDeniedError(domain: string) {
    Navigation.navigate(ROUTES.TRAVEL_DOMAIN_PERMISSION_INFO.getRoute(domain));
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

function openTravelDotAfterProvisioning(spotnanaToken: string) {
    Navigation.closeRHPFlow();
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
    Linking.openURL(buildTravelDotURL(spotnanaToken));
}

function provisionDomain(domain: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
    Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(domain));
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
        Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
        Navigation.navigate(ROUTES.TRAVEL_TCS.getRoute(CONST.TRAVEL.DEFAULT_DOMAIN));
    } else {
        const adminDomains = getAdminsPrivateEmailDomains(policy);
        let routeToNavigateTo;
        if (adminDomains.length === 0) {
            routeToNavigateTo = ROUTES.TRAVEL_PUBLIC_DOMAIN_ERROR;
        } else if (adminDomains.length === 1) {
            Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
            routeToNavigateTo = ROUTES.TRAVEL_TCS.getRoute(adminDomains.at(0) ?? CONST.TRAVEL.DEFAULT_DOMAIN);
        } else {
            routeToNavigateTo = ROUTES.TRAVEL_DOMAIN_SELECTOR;
        }
        Navigation.navigate(routeToNavigateTo);
    }
}

// eslint-disable-next-line import/prefer-default-export
export {acceptSpotnanaTerms, handleProvisioningPermissionDeniedError, openTravelDotAfterProvisioning, provisionDomain, bookATrip};
