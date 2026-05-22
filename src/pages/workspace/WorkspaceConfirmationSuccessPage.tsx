import React, {useCallback} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

function WorkspaceConfirmationSuccessPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const closePage = useCallback(() => {
        Navigation.closeRHPFlow();
    }, []);

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={WorkspaceConfirmationSuccessPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.new.confirmWorkspace')}
                onBackButtonPress={closePage}
            />
            <ConfirmationPage
                heading={translate('workspace.createdForClient.title')}
                description={translate('workspace.createdForClient.description')}
                descriptionStyle={[styles.ph5, styles.textSupporting]}
                shouldShowButton
                buttonText={translate('common.buttonConfirm')}
                onButtonPress={closePage}
            />
        </ScreenWrapper>
    );
}

WorkspaceConfirmationSuccessPage.displayName = 'WorkspaceConfirmationSuccessPage';

export default WorkspaceConfirmationSuccessPage;
