import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function MergeHRApprovalModePage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID="MergeHRApprovalModePage">
            <HeaderWithBackButton
                title={translate('workspace.hr.merge.approvalMode')}
                onBackButtonPress={() => Navigation.goBack()}
            />
        </ScreenWrapper>
    );
}

export default MergeHRApprovalModePage;
