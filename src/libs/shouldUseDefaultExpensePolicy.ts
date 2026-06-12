import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {BillingGraceEndPeriod, OnyxInputOrEntry, Policy} from '@src/types/onyx';
import {isGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(
    iouType: IOUType,
    defaultExpensePolicy: OnyxInputOrEntry<Policy>,
    amountOwed: OnyxEntry<number>,
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>,
    ownerBillingGracePeriodEnd: OnyxEntry<number>,
    currentUserAccountID?: number,
) {
    return (
        iouType === CONST.IOU.TYPE.CREATE &&
        isGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserAccountID)
    );
}

export default shouldUseDefaultExpensePolicy;
