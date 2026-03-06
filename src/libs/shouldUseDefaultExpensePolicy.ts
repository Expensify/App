import type {OnyxEntry} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import {isPaidGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(iouType: IOUType, defaultExpensePolicy: OnyxInputOrEntry<Policy>, amountOwed: OnyxEntry<number>) {
    return (
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id, undefined, amountOwed)
    );
}

export default shouldUseDefaultExpensePolicy;
