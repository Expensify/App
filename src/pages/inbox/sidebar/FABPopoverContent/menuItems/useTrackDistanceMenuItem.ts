import {useMemo} from 'react';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startDistanceRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';

type UseTrackDistanceMenuItemParams = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function useTrackDistanceMenuItem({shouldUseNarrowLayout, icons, reportID}: UseTrackDistanceMenuItemParams): PopoverMenuItem[] {
    const {translate} = useLocalize();
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    return useMemo(
        () => [
            {
                icon: icons.Location,
                text: translate('iou.trackDistance'),
                shouldCallAfterModalHide: shouldUseNarrowLayout,
                onSelected: () => {
                    interceptAnonymousUser(() => {
                        if (shouldRedirectToExpensifyClassic) {
                            showRedirectToExpensifyClassicModal();
                            return;
                        }
                        startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, lastDistanceExpenseType, undefined, undefined, true);
                    });
                },
                sentryLabel: CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE,
            },
        ],
        [icons.Location, translate, shouldUseNarrowLayout, shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal, reportID, lastDistanceExpenseType],
    );
}

export default useTrackDistanceMenuItem;
