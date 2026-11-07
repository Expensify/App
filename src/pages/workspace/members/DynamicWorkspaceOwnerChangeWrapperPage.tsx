import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNavigateToCardAuthenticationOnLink from '@hooks/useNavigateToCardAuthenticationOnLink';
import useOnyx from '@hooks/useOnyx';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import shouldShowChangeWorkspaceOwnerPage from '@libs/shouldShowChangeWorkspaceOwnerPage';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {checkBulkTransferPolicyBillingOwner, clearWorkspaceOwnerChangeFlow, requestWorkspaceOwnerChange} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import {createOwnedPaidAdminPolicyIDsSelector} from '@selectors/Policy';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import WorkspaceOwnerChangeAllWorkspacesCheck from './WorkspaceOwnerChangeAllWorkspacesCheck';
import WorkspaceOwnerChangeCheck from './WorkspaceOwnerChangeCheck';
import WorkspaceOwnerPaymentCardForm from './WorkspaceOwnerPaymentCardForm';

type DynamicWorkspaceOwnerChangeWrapperPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_OWNER_CHANGE_CHECK>;

function DynamicWorkspaceOwnerChangeWrapperPage({route, policy, isLoadingPolicy}: DynamicWorkspaceOwnerChangeWrapperPageProps) {
    const styles = useThemeStyles();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
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
    const [ownerPolicyIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createOwnedPaidAdminPolicyIDsSelector(policy?.ownerAccountID)});
    const otherOwnerPolicyIDs = ownerPolicyIDs.filter((ownerPolicyID) => ownerPolicyID !== policyID);

    // Undefined until the check answers, and empty once the transfer continues with this workspace only.
    const [transferablePolicyIDs, setTransferablePolicyIDs] = useState<string[]>();
    const isCheckingTransferablePolicies = otherOwnerPolicyIDs.length > 0 && !transferablePolicyIDs;
    const shouldShowAllWorkspacesCheck = !!transferablePolicyIDs && transferablePolicyIDs.length > 1;

    useNavigateToCardAuthenticationOnLink();

    const takeOverThisWorkspace = () => {
        setTransferablePolicyIDs([]);
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
    };

    useEffect(() => {
        if (isLoadingPolicy || policy?.isChangeOwnerFailed || policy?.isChangeOwnerSuccessful) {
            return;
        }
        if (otherOwnerPolicyIDs.length === 0) {
            requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
            return;
        }

        let ignore = false;
        checkBulkTransferPolicyBillingOwner([policyID, ...otherOwnerPolicyIDs]).then((policyIDs) => {
            if (ignore) {
                return;
            }
            if (policyIDs.includes(policyID) && policyIDs.length > 1) {
                setTransferablePolicyIDs(policyIDs);
                return;
            }
            takeOverThisWorkspace();
        });
        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- each run starts a new transfer, so it runs once per policy load
    }, [policyID, isLoadingPolicy]);

    useEffect(() => {
        if (!policy || policy?.isLoading) {
            return;
        }

        if (!policy.errorFields && policy.isChangeOwnerFailed) {
            Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_ERROR.path), {forceReplace: true});
            return;
        }

        if (!policy?.errorFields?.changeOwner && policy?.isChangeOwnerSuccessful) {
            Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_OWNER_CHANGE_SUCCESS.path), {forceReplace: true});
            return;
        }

        const changeOwnerErrors = Object.keys(policy?.errorFields?.changeOwner ?? {});

        if (changeOwnerErrors && changeOwnerErrors.length > 0) {
            Navigation.setParams({error: changeOwnerErrors.at(0)});
        }
    }, [accountID, policy, policy?.errorFields?.changeOwner, policyID, buildDynamicRoute]);

    const isLoading = isLoadingPolicy || !!policy?.isLoading || isCheckingTransferablePolicies;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={!shouldShowChangeWorkspaceOwnerPage(fundList, error)}
            canBeAccessedIfArchived
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
                            <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                        </View>
                    )}
                    {shouldShowPaymentCardForm && <WorkspaceOwnerPaymentCardForm policy={policy} />}
                    {!isLoading && !shouldShowPaymentCardForm && shouldShowAllWorkspacesCheck && (
                        <WorkspaceOwnerChangeAllWorkspacesCheck
                            policy={policy}
                            policyIDs={transferablePolicyIDs}
                            onTakeOverThisWorkspace={takeOverThisWorkspace}
                        />
                    )}
                    {!isLoading && !shouldShowPaymentCardForm && !shouldShowAllWorkspacesCheck && (
                        <WorkspaceOwnerChangeCheck
                            policy={policy}
                            accountID={accountID}
                            error={error}
                        />
                    )}
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(DynamicWorkspaceOwnerChangeWrapperPage);
