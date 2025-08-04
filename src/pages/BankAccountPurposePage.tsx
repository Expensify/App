import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function BankAccountPurposePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BankAccountPurposePage.displayName}
        >
            <FullPageNotFoundView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
