import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SidePanelButton from '@components/SidePanel/SidePanelButton';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@navigation/Navigation';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainSettingsPageProps = {
    domainAccountID: number;

    /** Settings page content */
    children: ReactNode;
};

function BaseDomainSettingsPage({domainAccountID, children}: BaseDomainSettingsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={BaseDomainSettingsPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldShowOfflineIndicator
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButtonAndTitle
                    title={translate('domain.common.settings')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
                >
                    <SidePanelButton />
                </HeaderWithBackButtonAndTitle>
                <View style={styles.flex1}>{children}</View>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainSettingsPage.displayName = 'BaseDomainSettingsPage';

export default BaseDomainSettingsPage;
