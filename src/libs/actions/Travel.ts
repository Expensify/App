import {Linking} from 'react-native';
import type {OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {buildTravelDotURL} from './Link';

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
    Linking.openURL(buildTravelDotURL(spotnanaToken));
    Navigation.goBack();
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

// eslint-disable-next-line import/prefer-default-export
export {acceptSpotnanaTerms, handleProvisioningPermissionDeniedError, openTravelDotAfterProvisioning};
