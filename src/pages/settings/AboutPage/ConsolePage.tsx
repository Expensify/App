import React from 'react';
import Console from '@components/Console';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function ConsolePage() {
    const {translate} = useLocalize();
    return (
        <ScreenWrapper testID={ConsolePage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.debugConsole')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            />
            <Console />
        </ScreenWrapper>
    );
}

ConsolePage.displayName = 'ConsolePage';

export default ConsolePage;
