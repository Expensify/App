import React from 'react';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function CancelSubscriptionMenuItem() {
    const icons = useMemoizedLazyExpensifyIcons(['CircleSlash']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
        <MenuItem
            title={translate('subscription.cancelSubscription.title')}
            icon={icons.CircleSlash}
            shouldShowRightIcon
            wrapperStyle={styles.sectionMenuItemTopDescription}
            titleStyle={styles.textStrong}
            onPress={handleCancelSubscriptionPress}
            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_SUBSCRIPTION.CANCEL_SUBSCRIPTION}
        />
    );
}

export default CancelSubscriptionMenuItem;
