import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CardAuthenticationModal from '@pages/settings/Subscription/CardAuthenticationModal';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import * as MemberActions from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import WorkspaceOwnerChangeCheck from './WorkspaceOwnerChangeCheck';
import WorkspaceOwnerPaymentCardForm from './WorkspaceOwnerPaymentCardForm';

type WorkspaceOwnerChangeWrapperPageProps = WithPolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeWrapperPage({route, policy}: WorkspaceOwnerChangeWrapperPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const policyID = route.params.policyID;
    const accountID = route.params.accountID;
    const error = route.params.error;
    const shouldShowPaymentCardForm =
        error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD || privateStripeCustomerID?.status === CONST.STRIPE_GBP_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED;

    useEffect(() => {
        if (!policy || policy?.isLoading) {
            return;
        }

        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            // there are some errors but not related to change owner flow - show an error page
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.getRoute(policyID, accountID));
            return;
        }

        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            // no errors - show a success page
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.getRoute(policyID, accountID));
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, changeOwnerErrors[0] as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
        }
    }, [accountID, policy, policy?.errorFields?.changeOwner, policyID]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
        >
            <ScreenWrapper testID={WorkspaceOwnerChangeWrapperPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                    onBackButtonPress={() => {
                        MemberActions.clearWorkspaceOwnerChangeFlow(policyID);
                        Navigation.goBack();
                        Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                    }}
                />
                <View style={[styles.containerWithSpaceBetween, error !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD ? styles.ph5 : styles.ph0, styles.pb0]}>
                    {policy?.isLoading && <FullScreenLoadingIndicator />}
                    {!policy?.isLoading &&
                        (shouldShowPaymentCardForm ? (
                            <WorkspaceOwnerPaymentCardForm policy={policy} />
                        ) : (
                            <WorkspaceOwnerChangeCheck
                                policy={policy}
                                accountID={accountID}
                                error={error}
                            />
                        ))}
                    <CardAuthenticationModal
                        headerTitle={translate('subscription.authenticatePaymentCard')}
                        policyID={policyID}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeWrapperPage.displayName = 'WorkspaceOwnerChangeWrapperPage';

export default withPolicy(WorkspaceOwnerChangeWrapperPage);
