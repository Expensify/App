import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import * as PolicyActions from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import WorkspaceOwnerChangeCheck from './WorkspaceOwnerChangeCheck';
import WorkspaceOwnerPaymentCardForm from './WorkspaceOwnerPaymentCardForm';

type WorkspaceOwnerChangeWrapperPageProps = WithPolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeWrapperPage({route, policy}: WorkspaceOwnerChangeWrapperPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const accountID = route.params.accountID;
    const error = route.params.error;

    useEffect(() => {
        if (!policy || policy?.isLoading) {
            return;
        }

        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            // there are some errors but not related to change owner flow - show an error page
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.getRoute(policyID, accountID));
            return;
        }

        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            // no errors - show a success page
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.getRoute(policyID, accountID));
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0 && changeOwnerErrors[0] !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD) {
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, changeOwnerErrors[0] as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
        }
    }, [accountID, policy, policy?.errorFields?.changeOwner, policyID]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeWrapperPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => {
                            PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
                            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                        }}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.ph5, error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD ? styles.pb0 : styles.pb5]}>
                        {policy?.isLoading && <FullScreenLoadingIndicator />}
                        {!policy?.isLoading &&
                            (error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD ? (
                                <WorkspaceOwnerPaymentCardForm policy={policy} />
                            ) : (
                                <WorkspaceOwnerChangeCheck
                                    policy={policy}
                                    accountID={accountID}
                                    error={error}
                                />
                            ))}
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeWrapperPage.displayName = 'WorkspaceOwnerChangeWrapperPage';

export default withPolicy(WorkspaceOwnerChangeWrapperPage);
