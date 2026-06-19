import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import FABFocusableMenuItem from '@pages/inbox/sidebar/FABPopoverContent/FABFocusableMenuItem';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const ITEM_ID = CONST.FAB_MENU_ITEM_IDS.BOOK_EVENTS;

function BookEventsMenuItem() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid']);

    return (
        <FABFocusableMenuItem
            itemId={ITEM_ID}
            pressableTestID={CONST.SENTRY_LABEL.FAB_MENU.BOOK_EVENTS}
            icon={icons.CalendarSolid}
            title={translate('events.bookEvents')}
            onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.EVENTS))}
            shouldCallAfterModalHide={shouldUseNarrowLayout}
        />
    );
}

export default BookEventsMenuItem;
