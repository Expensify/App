import {useMemo} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseExpenseMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function useExpenseMenuItem({shouldUseNarrowLayout, icons, reportID}: UseExpenseMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    return useMemo(
        () => [
            {
                icon: getIconForAction(CONST.IOU.TYPE.CREATE, icons as Parameters<typeof getIconForAction>[1]),
                text: translate('iou.createExpense'),
                testID: 'create-expense',
                shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout,
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                            return;
                        }
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                    }),
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE,
            },
        ],
        [translate, shouldRedirectToExpensifyClassic, shouldUseNarrowLayout, allTransactionDrafts, reportID, icons, showRedirectToExpensifyClassicModal],
    );
}

export default useExpenseMenuItem;
