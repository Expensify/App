import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {BillingGraceEndPeriod, OnyxInputOrEntry, Policy} from '@src/types/onyx';
import {isPaidGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(
    iouType: IOUType,
    defaultExpensePolicy: OnyxInputOrEntry<Policy>,
    amountOwed: OnyxEntry<number>,
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>,
    ownerBillingGracePeriodEnd: OnyxEntry<number>,
) {
    return (
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, defaultExpensePolicy)
    );
}

export default shouldUseDefaultExpensePolicy;
