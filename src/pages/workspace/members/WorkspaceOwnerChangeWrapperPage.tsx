import React, {useEffect} from 'react';
import {View} from 'react-native';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import shouldShowChangeWorkspaceOwnerPage from '@libs/shouldShowChangeWorkspaceOwnerPage';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CardAuthenticationModal from '@pages/settings/Subscription/CardAuthenticationModal';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@userActions/Policy/Member';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import WorkspaceOwnerChangeCheck from './WorkspaceOwnerChangeCheck';
import WorkspaceOwnerPaymentCardForm from './WorkspaceOwnerPaymentCardForm';

type WorkspaceOwnerChangeWrapperPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeWrapperPage({route, policy}: WorkspaceOwnerChangeWrapperPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID, {canBeMissing: true});
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST, {canBeMissing: true});
    const policyID = route.params.policyID;
    const accountID = Number(route.params.accountID);
    const error = route.params.error;
    const backTo = route.params.backTo;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isAuthRequired = privateStripeCustomerID?.status === CONST.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED;
    const shouldShowPaymentCardForm = error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD || isAuthRequired;

    useEffect(() => {
        if (policy?.isChangeOwnerFailed || policy?.isChangeOwnerSuccessful) {
            return;
        }
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyID]);

    useEffect(() => {
        if (!policy || policy?.isLoading) {
            return;
        }

        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            // there are some errors but not related to change owner flow - show an error page
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.getRoute(policyID, accountID, backTo));
            return;
        }

        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            // no errors - show a success page
            Navigation.goBack();
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.getRoute(policyID, accountID, backTo));
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation.setParams({error: changeOwnerErrors.at(0)});
        }
    }, [accountID, backTo, policy, policy?.errorFields?.changeOwner, policyID]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShowChangeWorkspaceOwnerPage(fundList, error)}
        >
            <ScreenWrapper testID="WorkspaceOwnerChangeWrapperPage">
                <HeaderWithBackButton
                    title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                    onBackButtonPress={() => {
                        clearWorkspaceOwnerChangeFlow(policyID);
                        if (backTo) {
                            Navigation.goBack(backTo);
                        } else {
                            Navigation.goBack();
                            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                        }
                    }}
                />
                <View style={[styles.containerWithSpaceBetween, error !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD ? styles.ph5 : styles.ph0, styles.pb0]}>
                    {!!policy?.isLoading && <FullScreenLoadingIndicator />}
                    {shouldShowPaymentCardForm && <WorkspaceOwnerPaymentCardForm policy={policy} />}
                    {!policy?.isLoading && !shouldShowPaymentCardForm && (
                        <WorkspaceOwnerChangeCheck
                            policy={policy}
                            accountID={accountID}
                            error={error}
                        />
                    )}
                    <CardAuthenticationModal
                        headerTitle={translate('subscription.authenticatePaymentCard')}
                        policyID={policyID}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceOwnerChangeWrapperPage);
