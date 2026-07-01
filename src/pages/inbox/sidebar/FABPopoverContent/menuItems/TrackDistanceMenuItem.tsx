import React from 'react';
import useLastDistanceExpenseType from '@hooks/useLastDistanceExpenseType';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startDistanceRequest} from '@libs/actions/IOU/MoneyRequest';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE;

type TrackDistanceMenuItemProps = {
    reportID: string;
};

function TrackDistanceMenuItem({reportID}: TrackDistanceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Location']);
    const lastDistanceExpenseType = useLastDistanceExpenseType();
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE}
            icon={icons.Location}
            title={translate('iou.trackDistance')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    // Start the flow to start tracking a distance request
                    startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, lastDistanceExpenseType, undefined, undefined, true);
                })
            }
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default TrackDistanceMenuItem;
