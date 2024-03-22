import React, {useCallback} from "react";
import HeaderWithBackButton from "@components/HeaderWithBackButton";
import * as PolicyActions from "@userActions/Policy";
import Navigation from "@navigation/Navigation";
import ROUTES from "@src/ROUTES";
import PaidPolicyAccessOrNotFoundWrapper from "@pages/workspace/PaidPolicyAccessOrNotFoundWrapper";
import ScreenWrapper from "@components/ScreenWrapper";
import AdminPolicyAccessOrNotFoundWrapper from "@pages/workspace/AdminPolicyAccessOrNotFoundWrapper";
import useLocalize from "@hooks/useLocalize";
import type {StackScreenProps} from "@react-navigation/stack";
import type {SettingsNavigatorParamList} from "@navigation/types";
import type SCREENS from "@src/SCREENS";
import ConfirmationPage from "@components/ConfirmationPage";
import LottieAnimations from "@components/LottieAnimations";
import useThemeStyles from "@hooks/useThemeStyles";

type WorkspaceOwnerChangeSuccessPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeSuccessPage({route}: WorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID) ?? 0;
    const policyID = route.params.policyID;

    const closePage = useCallback(() => {
        PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeSuccessPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={closePage}
                    />
                    <ConfirmationPage
                        animation={LottieAnimations.Fireworks}
                        heading={translate('workspace.changeOwner.successTitle')}
                        description={translate('workspace.changeOwner.successDescription')}
                        descriptionStyle={styles.textSupporting}
                        shouldShowButton
                        buttonText={translate('common.buttonConfirm')}
                        onButtonPress={closePage}
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeSuccessPage.displayName = 'WorkspaceOwnerChangeSuccessPage';

export default WorkspaceOwnerChangeSuccessPage;
