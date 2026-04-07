import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {validTransactionDraftIDsSelector} from '@src/selectors/TransactionDraft';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.EXPENSE;

type ExpenseMenuItemProps = {
    reportID: string;
};

function ExpenseMenuItem({reportID}: ExpenseMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Receipt', 'Cash', 'Transfer', 'MoneyCircle']);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const {shouldRedirectToExpensifyClassic, canRedirectToExpensifyClassic, canUseAction, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            isVisible={canUseAction}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE}
            icon={getIconForAction(CONST.IOU.TYPE.CREATE, icons)}
            title={translate('iou.createExpense')}
            onPress={() =>
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        if (canRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                        }
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, draftTransactionIDs, undefined, undefined, undefined, true);
                })
            }
            shouldCallAfterModalHide={canRedirectToExpensifyClassic || shouldUseNarrowLayout}
        />
    );
}

export default ExpenseMenuItem;
