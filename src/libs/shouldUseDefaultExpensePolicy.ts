import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import {isPaidGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(iouType: IOUType, defaultExpensePolicy: OnyxInputOrEntry<Policy>, isFromDeepLink = false) {
    return (
        (iouType === CONST.IOU.TYPE.CREATE || isFromDeepLink) &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
    );
}

export default shouldUseDefaultExpensePolicy;
