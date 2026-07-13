import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import shouldShowChangeWorkspaceOwnerPage from '@libs/shouldShowChangeWorkspaceOwnerPage';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CardAuthenticationModal from '@pages/settings/Subscription/CardAuthenticationModal';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import WorkspaceOwnerChangeCheck from './WorkspaceOwnerChangeCheck';
import WorkspaceOwnerPaymentCardForm from './WorkspaceOwnerPaymentCardForm';

type DynamicWorkspaceOwnerChangeWrapperPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK>;

function DynamicWorkspaceOwnerChangeWrapperPage({route, policy, isLoadingPolicy}: DynamicWorkspaceOwnerChangeWrapperPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.path);
    const [privateStripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const policyID = route.params.policyID;
    const accountID = Number(route.params.accountID);
    const error = route.params.error;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isAuthRequired = privateStripeCustomerID?.status === CONST.STRIPE_SCA_AUTH_STATUSES.CARD_AUTHENTICATION_REQUIRED;
    const shouldShowPaymentCardForm = error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD || isAuthRequired;

    useEffect(() => {
        if (isLoadingPolicy || policy?.isChangeOwnerFailed || policy?.isChangeOwnerSuccessful) {
            return;
        }
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [policyID, isLoadingPolicy]);

    useEffect(() => {
        if (!policy || policy?.isLoading) {
            return;
        }

        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.path), {forceReplace: true});
            return;
        }

        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.path), {forceReplace: true});
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation.setParams({error: changeOwnerErrors.at(0)});
        }
    }, [accountID, policy, policy?.errorFields?.changeOwner, policyID]);

    const isLoading = isLoadingPolicy || !!policy?.isLoading;

    const reasonAttributes: SkeletonSpanReasonAttributes = {
        context: 'DynamicWorkspaceOwnerChangeWrapperPage',
        isLoadingPolicy: !!isLoadingPolicy,
        isPolicyLoading: !!policy?.isLoading,
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShowChangeWorkspaceOwnerPage(fundList, error)}
        >
            <ScreenWrapper testID="DynamicWorkspaceOwnerChangeWrapperPage">
                <HeaderWithBackButton
                    title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                    onBackButtonPress={() => {
                        clearWorkspaceOwnerChangeFlow(policyID);
                        Navigation.goBack(backPath);
                    }}
                />
                <View style={[styles.containerWithSpaceBetween, shouldShowPaymentCardForm ? styles.ph0 : styles.ph5, styles.pb0]}>
                    {isLoading && (
                        <View style={[StyleSheet.absoluteFill, styles.fullScreenLoading]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                reasonAttributes={reasonAttributes}
                            />
                        </View>
                    )}
                    {shouldShowPaymentCardForm && <WorkspaceOwnerPaymentCardForm policy={policy} />}
                    {!isLoading && !shouldShowPaymentCardForm && (
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

export default withPolicy(DynamicWorkspaceOwnerChangeWrapperPage);
