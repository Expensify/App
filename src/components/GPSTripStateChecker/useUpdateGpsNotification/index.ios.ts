import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';

import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';

import {shouldUpdateGpsNotificationUnit, updateGpsTripNotificationLanguage, updateGpsTripNotificationUnit} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

function useUpdateGpsNotification() {
    useUpdateGpsNotificationOnLanguageChange();
    useUpdateGpsNotificationOnUnitChange();
}

function useUpdateGpsNotificationOnLanguageChange() {
    const {translate, preferredLocale} = useLocalize();
    const currentPreferredLocale = useRef(preferredLocale);

    useEffect(() => {
        if (currentPreferredLocale.current === preferredLocale) {
            return;
        }

        currentPreferredLocale.current = preferredLocale;

        if (!shouldUpdateGpsNotificationUnit()) {
            return;
        }

        updateGpsTripNotificationLanguage(translate);
    }, [preferredLocale, translate]);
}

function useUpdateGpsNotificationOnUnitChange() {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const personalPolicy = usePersonalPolicy();
    const shouldUseDefaultExpensePolicy = shouldUseDefaultExpensePolicyUtil(
        CONST.IOU.TYPE.CREATE,
        defaultExpensePolicy,
        amountOwed,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        currentUserPersonalDetails.accountID,
    );

    const unit = DistanceRequestUtils.getRate({
        transaction,
        policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : undefined,
        personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
    }).unit;

    useEffect(() => {
        if (!shouldUpdateGpsNotificationUnit()) {
            return;
        }

        updateGpsTripNotificationUnit(translate, unit);
    }, [unit, translate]);
}

export default useUpdateGpsNotification;
