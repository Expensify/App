import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import {startDistanceRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import useFABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/useFABMenuItem';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE;

type TrackDistanceMenuItemProps = {
    reportID: string;
};

function TrackDistanceMenuItem({reportID}: TrackDistanceMenuItemProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['Location'] as const);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();
    const {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress} = useFABMenuItem(ITEM_ID);

    return (
        <FocusableMenuItem
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE}
            icon={icons.Location}
            title={translate('iou.trackDistance')}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            onPress={() =>
                onItemPress(
                    () =>
                        interceptAnonymousUser(() => {
                            if (shouldRedirectToExpensifyClassic) {
                                showRedirectToExpensifyClassicModal();
                                return;
                            }
                            startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, lastDistanceExpenseType, undefined, undefined, true);
                        }),
                    {shouldCallAfterModalHide: shouldUseNarrowLayout},
                )
            }
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default TrackDistanceMenuItem;
