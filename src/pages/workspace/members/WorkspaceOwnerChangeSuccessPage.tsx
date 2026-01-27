import React, {useCallback, useRef} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {clearWorkspaceOwnerChangeFlow} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceOwnerChangeSuccessPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_SUCCESS>;

function WorkspaceOwnerChangeSuccessPage({route}: WorkspaceOwnerChangeSuccessPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route.params.accountID) ?? -1;
    const policyID = route.params.policyID;
    const backTo = route.params.backTo;

    const closePage = useCallback(() => {
        if (backTo) {
            Navigation.goBack(backTo);
        } else {
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
        }
        clearWorkspaceOwnerChangeFlow(policyID);
    }, [accountID, backTo, policyID]);

    const policy = usePolicy(policyID);
    const shouldShowRef = useRef(!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShowRef.current}
        >
            <ScreenWrapper testID="WorkspaceOwnerChangeSuccessPage">
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

export default WorkspaceOwnerChangeSuccessPage;
