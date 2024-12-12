import React, {useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function RequestEarlyCancellationMenuItem() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const handleRequestEarlyCancellationPress = () => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION);
    };
    return (
        <>
            <MenuItem
                title={translate('subscription.requestEarlyCancellation.title')}
                icon={Expensicons.CalendarSolid}
                shouldShowRightIcon
                wrapperStyle={styles.sectionMenuItemTopDescription}
                onPress={handleRequestEarlyCancellationPress}
            />
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </>
    );
}

RequestEarlyCancellationMenuItem.displayName = 'RequestEarlyCancellationMenuItem';

export default RequestEarlyCancellationMenuItem;
