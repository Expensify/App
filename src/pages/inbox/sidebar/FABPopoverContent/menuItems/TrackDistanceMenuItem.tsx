import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {startDistanceRequest} from '@libs/actions/IOU/MoneyRequest';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getDistanceExpenseTypeForPolicy} from '@libs/PolicyDistanceRatesUtils';

import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

import React from 'react';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE;

type TrackDistanceMenuItemProps = {
    reportID: string;
};

function TrackDistanceMenuItem({reportID}: TrackDistanceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Location']);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const policy = usePolicy(report?.policyID);
    const distanceExpenseType = getDistanceExpenseTypeForPolicy(policy, lastDistanceExpenseType);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: report?.policyID,
        isDistanceRequest: true,
    });

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE}
            icon={icons.Location}
            title={translate('iou.trackDistance')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (blockDistanceRequestIfNeeded()) {
                        return;
                    }
                    // Start the flow to start tracking a distance request
                    startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, distanceExpenseType, undefined, undefined, true);
                })
            }
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default TrackDistanceMenuItem;
