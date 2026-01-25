import React, {useContext} from 'react';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationMenuItem() {
    const icons = useMemoizedLazyExpensifyIcons(['CalendarSolid']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isActingAsDelegate, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);

    const handleRequestEarlyCancellationPress = () => {
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION);
    };
    return (
        <MenuItem
            title={translate('subscription.requestEarlyCancellation.title')}
            icon={icons.CalendarSolid}
            shouldShowRightIcon
            wrapperStyle={styles.sectionMenuItemTopDescription}
            onPress={handleRequestEarlyCancellationPress}
        />
    );
}

export default RequestEarlyCancellationMenuItem;
