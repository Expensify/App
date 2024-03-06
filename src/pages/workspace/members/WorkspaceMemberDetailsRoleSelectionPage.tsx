import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';

function WorkspaceMemberDetailsRoleSelectionPage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={WorkspaceMemberDetailsRoleSelectionPage.displayName}>
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={translate('common.role')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceMemberDetailsRoleSelectionPage.displayName = 'WorkspaceMemberDetailsRoleSelectionPage';

export default WorkspaceMemberDetailsRoleSelectionPage;
