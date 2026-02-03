import type {OnyxCollection} from 'react-native-onyx';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import {isPaidGroupPolicy} from './PolicyUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';

function shouldUseDefaultExpensePolicy(iouType: IOUType, defaultExpensePolicy: OnyxInputOrEntry<Policy>, policies: OnyxCollection<Policy>) {
    return (
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(policies, defaultExpensePolicy.id)
    );
}

export default shouldUseDefaultExpensePolicy;
