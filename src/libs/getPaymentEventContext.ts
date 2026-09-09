import ONYXKEYS from '@src/ONYXKEYS';
import {hasSeenTourSelector} from '@src/selectors/Onboarding';
import type {Beta, BillingGraceEndPeriod, IntroSelected} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type PaymentEventContext = {
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    isSelfTourViewed: boolean;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
};

function getPaymentEventContext(): Promise<PaymentEventContext> {
    return Promise.all([
        Onyx.get(ONYXKEYS.NVP_INTRO_SELECTED),
        Onyx.get(ONYXKEYS.BETAS),
        Onyx.get(ONYXKEYS.NVP_ONBOARDING),
        Onyx.get(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END),
        Onyx.get(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED),
        Onyx.get(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END),
    ]).then(([introSelected, betas, onboarding, userBillingGracePeriodEnds, amountOwed, ownerBillingGracePeriodEnd]) => ({
        introSelected,
        betas,
        isSelfTourViewed: hasSeenTourSelector(onboarding) ?? false,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
    }));
}

export default getPaymentEventContext;
export type {PaymentEventContext};
