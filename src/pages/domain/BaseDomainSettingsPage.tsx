import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainSettingsPageProps = {
    /** The ID of the domain used for the not found wrapper */
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
                <HeaderWithBackButton
                    title={translate('domain.common.settings')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
                />
                <View style={styles.flex1}>{children}</View>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainSettingsPage.displayName = 'BaseDomainSettingsPage';

export default BaseDomainSettingsPage;
