import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationMenuItem() {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <MenuItem
            title={translate('subscription.requestEarlyCancellation.title')}
            icon={Expensicons.CalendarSolid}
            iconFill={theme.success}
            shouldShowRightIcon
            wrapperStyle={styles.sectionMenuItemTopDescription}
            onPress={() => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION)}
        />
    );
}

RequestEarlyCancellationMenuItem.displayName = 'RequestEarlyCancellationMenuItem';

export default RequestEarlyCancellationMenuItem;
