import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getDistanceExpenseTypeForPolicy} from '@libs/PolicyDistanceRatesUtils';
import {getAddExpenseDropdownOptions} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

import React from 'react';

import {useReportPreviewData} from './MoneyRequestReportPreviewContext';

function AddExpenseActionButton() {
    const {translate} = useLocalize();
    const {iouReport, chatReportID, policy} = useReportPreviewData();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'ReceiptPlus', 'Plus']);

    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const distanceExpenseType = getDistanceExpenseTypeForPolicy(policy, lastDistanceExpenseType);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: policy?.id,
        isDistanceRequest: true,
    });

    return (
        <ButtonWithDropdownMenu
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            onPress={() => {}}
            shouldAlwaysShowDropdownMenu
            customText={translate('iou.addExpense')}
            options={getAddExpenseDropdownOptions({
                translate,
                icons: expensifyIcons,
                iouReportID: iouReport?.reportID,
                policy,
                userBillingGracePeriodEnds,
                draftTransactionIDs,
                amountOwed,
                ownerBillingGracePeriodEnd,
                iouRequestBackToReport: chatReportID,
                unreportedExpenseBackToReport: iouReport?.parentReportID,
                lastDistanceExpenseType: distanceExpenseType,
                currentUserAccountID: currentUserDetails.accountID,
                blockDistanceRequestIfNeeded,
            })}
            isSplitButton={false}
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            }}
            sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.ADD_EXPENSE_BUTTON}
        />
    );
}

export default AddExpenseActionButton;
