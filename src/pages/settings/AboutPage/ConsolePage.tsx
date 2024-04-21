import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ConsoleComponents from "@components/ClientSideLoggingToolMenu/ConsoleComponents";

function ConsolePage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={ConsolePage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.debugConsole')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_TROUBLESHOOT)}
            />
            <ConsoleComponents/>
        </ScreenWrapper>
    );
}

ConsolePage.displayName = 'ConsolePage';

export default ConsolePage;
