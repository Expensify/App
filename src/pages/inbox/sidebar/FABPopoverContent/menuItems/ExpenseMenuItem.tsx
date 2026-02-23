import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {useFABMenuContext} from '@pages/inbox/sidebar/FABPopoverContent/FABMenuContext';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ExpenseMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
    /** Injected by FABPopoverMenu via React.cloneElement */
    itemIndex?: number;
};

function ExpenseMenuItem({shouldUseNarrowLayout, icons, reportID, itemIndex = -1}: ExpenseMenuItemProps) {
    const {translate} = useLocalize();
    const [allTransactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const {focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.CREATE_EXPENSE}
            icon={getIconForAction(CONST.IOU.TYPE.CREATE, icons as Parameters<typeof getIconForAction>[1])}
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
