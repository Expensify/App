import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as MemberActions from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceOwnerChangeSuccessPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS>;

function WorkspaceOwnerChangeSuccessPage({route}: WorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID);
    const policyID = route.params.policyID;

    const closePage = useCallback(() => {
        MemberActions.clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.goBack();
        Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
        >
            <ScreenWrapper testID={WorkspaceOwnerChangeSuccessPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                    onBackButtonPress={closePage}
                />
                <ConfirmationPage
                    illustration={LottieAnimations.Fireworks}
                    heading={translate('workspace.changeOwner.successTitle')}
                    description={translate('workspace.changeOwner.successDescription')}
                    descriptionStyle={styles.textSupporting}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={closePage}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeSuccessPage.displayName = 'WorkspaceOwnerChangeSuccessPage';

export default WorkspaceOwnerChangeSuccessPage;
