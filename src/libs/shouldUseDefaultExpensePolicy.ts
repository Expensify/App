import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {BillingGraceEndPeriod, Policy} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {isGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(
    iouType: IOUType,
    defaultExpensePolicy: OnyxEntry<Policy> | null,
    amountOwed: OnyxEntry<number>,
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>,
    ownerBillingGracePeriodEnd: OnyxEntry<number>,
    currentUserAccountID: number,
) {
    if (iouType !== CONST.IOU.TYPE.CREATE || !defaultExpensePolicy || !isGroupPolicy(defaultExpensePolicy)) {
        return false;
    }

    return !shouldRestrictUserBillableActions(defaultExpensePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID);
}

export default shouldUseDefaultExpensePolicy;
