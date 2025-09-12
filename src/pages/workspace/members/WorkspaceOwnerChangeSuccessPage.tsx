import React, {useCallback} from 'react';
import {InteractionManager} from 'react-native';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import LottieAnimations from '@components/LottieAnimations';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
        InteractionManager.runAfterInteractions(() => {
            clearWorkspaceOwnerChangeFlow(policyID);
        });
    }, [accountID, backTo, policyID]);

    const policy = usePolicy(policyID);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isCurrentUserOwner = policy?.owner === currentUserPersonalDetails?.login;
    const personalDetails = usePersonalDetails();
    const isMember = policy?.employeeList?.[personalDetails?.[accountID]?.login ?? '']?.role === CONST.POLICY.ROLE.USER;
    const shouldShow = (!isCurrentUserOwner && isMember) || (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShow}
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
