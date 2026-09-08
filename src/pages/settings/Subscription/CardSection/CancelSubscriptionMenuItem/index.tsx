import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

function CancelSubscriptionMenuItem() {
    const icons = useMemoizedLazyExpensifyIcons(['CircleSlash']);
    const {translate} = useLocalize();
    const {isActingAsDelegate} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const handleCancelSubscriptionPress = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_CANCEL_SUBSCRIPTION);
    };
    return (
        <MenuItemSectionRow
            onPress={handleCancelSubscriptionPress}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.CANCEL_SUBSCRIPTION}
        >
            <MenuItem.Row>
                <MenuItem.Icon src={icons.CircleSlash} />
                <MenuItem.Content>
                    <MenuItem.Title>{translate('subscription.cancelSubscription.title')}</MenuItem.Title>
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItemSectionRow>
    );
}

export default CancelSubscriptionMenuItem;
