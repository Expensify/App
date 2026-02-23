import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ExpenseMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function ExpenseMenuItem({shouldUseNarrowLayout, icons, reportID}: ExpenseMenuItemProps) {
    const {translate} = useLocalize();
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE}
            icon={getIconForAction(CONST.IOU.TYPE.CREATE, icons as Parameters<typeof getIconForAction>[1])}
            text={translate('iou.createExpense')}
            testID="create-expense"
            shouldCallAfterModalHide={shouldRedirectToExpensifyClassic || shouldUseNarrowLayout}
            onSelected={() =>
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        showRedirectToExpensifyClassicModal();
                        return;
                    }
                    startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE}
        />
    );
}

export default ExpenseMenuItem;
