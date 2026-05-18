import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function MergeHRFinalApproverPage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID="MergeHRFinalApproverPage">
            <HeaderWithBackButton
                title={translate('workspace.hr.merge.finalApprover')}
                onBackButtonPress={() => Navigation.goBack()}
            />
        </ScreenWrapper>
    );
}

export default MergeHRFinalApproverPage;
