import {useEffect} from 'react';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import shouldUseDefaultExpensePolicyUtil from '@libs/shouldUseDefaultExpensePolicy';
import {shouldUpdateGpsNotificationUnit, updateGpsTripNotificationUnit} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useUpdateGpsNotificationOnUnitChange() {
    const {translate} = useLocalize();

    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`);

    const defaultExpensePolicy = useDefaultExpensePolicy();
    const shouldUseDefaultExpensePolicy = shouldUseDefaultExpensePolicyUtil(CONST.IOU.TYPE.CREATE, defaultExpensePolicy, amountOwed);

    const unit = DistanceRequestUtils.getRate({transaction, policy: shouldUseDefaultExpensePolicy ? defaultExpensePolicy : undefined}).unit;

    useEffect(() => {
        if (!shouldUpdateGpsNotificationUnit()) {
            return;
        }

        updateGpsTripNotificationUnit(translate, unit);
    }, [unit, translate]);
}

export default useUpdateGpsNotificationOnUnitChange;
