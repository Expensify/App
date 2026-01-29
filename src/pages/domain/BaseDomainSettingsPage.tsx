import type {ReactNode} from 'react';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import DomainNotFoundPageWrapper from './DomainNotFoundPageWrapper';

type BaseDomainSettingsPageProps = {
    /** The ID of the domain used for the not found wrapper */
    domainAccountID: number;

    /** Settings page content */
    children: ReactNode;
};

function BaseDomainSettingsPage({domainAccountID, children}: BaseDomainSettingsPageProps) {
    const {translate} = useLocalize();

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID={BaseDomainSettingsPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('domain.common.settings')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
                />
                {children}
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

BaseDomainSettingsPage.displayName = 'BaseDomainSettingsPage';

export default BaseDomainSettingsPage;
