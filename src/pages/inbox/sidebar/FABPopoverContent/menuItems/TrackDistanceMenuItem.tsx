import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {startDistanceRequest} from '@libs/actions/IOU';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import FABMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABMenuItem';
import type {MenuItemIcons} from '@pages/inbox/sidebar/FABPopoverContent/types';
import useRedirectToExpensifyClassic from '@pages/inbox/sidebar/FABPopoverContent/useRedirectToExpensifyClassic';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TrackDistanceMenuItemProps = {
    shouldUseNarrowLayout: boolean;
    icons: MenuItemIcons;
    reportID: string;
};

function TrackDistanceMenuItem({shouldUseNarrowLayout, icons, reportID}: TrackDistanceMenuItemProps) {
    const {translate} = useLocalize();
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const {shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal} = useRedirectToExpensifyClassic();

    return (
        <FABMenuItem
            registryId={CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE}
            icon={icons.Location}
            text={translate('iou.trackDistance')}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
            onSelected={() => {
                interceptAnonymousUser(() => {
                    if (shouldRedirectToExpensifyClassic) {
                        showRedirectToExpensifyClassicModal();
                        return;
                    }
                    startDistanceRequest(CONST.IOU.TYPE.CREATE, reportID, lastDistanceExpenseType, undefined, undefined, true);
                });
            }}
            sentryLabel={CONST.SENTRY_LABEL.FAB_MENU.TRACK_DISTANCE}
        />
    );
}

export default TrackDistanceMenuItem;
