import React, {useLayoutEffect} from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const ITEM_ID = 'expense';

type ExpenseMenuItemProps = {
    reportID: string;
};

function ExpenseMenuItem({reportID}: ExpenseMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Coins', 'Receipt', 'Cash', 'Transfer', 'MoneyCircle'] as const);
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const {focusedIndex, setFocusedIndex, onItemPress, registeredItems, registerItem, unregisterItem} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    useLayoutEffect(() => {
        registerItem(ITEM_ID);
        return () => unregisterItem(ITEM_ID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const itemIndex = registeredItems.indexOf(ITEM_ID);

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE}
            icon={getIconForAction(CONST.IOU.TYPE.CREATE, icons)}
            title={translate('iou.createExpense')}
            focused={focusedIndex === itemIndex}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() =>
                onItemPress(
                    () =>
                        interceptAnonymousUser(() => {
                            if (shouldRedirectToExpensifyClassic) {
                                showRedirectToExpensifyClassicModal();
                                return;
                            }
                            startMoneyRequest(CONST.IOU.TYPE.CREATE, reportID, undefined, undefined, undefined, allTransactionDrafts, true);
                        }),
                    {shouldCallAfterModalHide: shouldRedirectToExpensifyClassic || shouldUseNarrowLayout},
                )
            }
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={StyleUtils.getItemBackgroundColorStyle(false, focusedIndex === itemIndex, false, theme.activeComponentBG, theme.hoverComponentBG)}
        />
    );
}

export default ExpenseMenuItem;
