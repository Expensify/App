import {WRITE_COMMANDS} from '@libs/API/types';
import Growl from '@libs/Growl';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type Middleware from './types';

/** Treats an overlapping balance retry as informational while the original payment finishes. */
const HandleBalancePaymentInProgress: Middleware = (responsePromise, request) =>
    responsePromise.then((response) => {
        if (request.command !== WRITE_COMMANDS.CLEAR_OUTSTANDING_BALANCE || !response || response.jsonCode !== CONST.JSON_CODE.ACCOUNT_BILLING_IN_PROGRESS) {
            return response;
        }

        const failureUpdate = (request.failureData as AnyOnyxUpdate[] | undefined)?.find((update) => update.key === ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
        if (!failureUpdate?.value) {
            return response;
        }
        failureUpdate.value = false;

        const bodyText = IntlStore.get('subscription.billingBanner.retryBillingInProgress') ?? response.message;
        if (bodyText) {
            Growl.show({type: CONST.GROWL.WARNING, bodyText});
        }
        return response;
    });

export default HandleBalancePaymentInProgress;
