import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function ZenefitsApprovalModePage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID="ZenefitsApprovalModePage">
            <HeaderWithBackButton
                title={translate('workspace.common.hr')}
                onBackButtonPress={() => Navigation.goBack()}
            />
        </ScreenWrapper>
    );
}

export default ZenefitsApprovalModePage;
