import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNavigateToCardAuthenticationOnLink from '@hooks/useNavigateToCardAuthenticationOnLink';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {rand64} from '@libs/NumberUtils';
import shouldShowChangeWorkspaceOwnerPage from '@libs/shouldShowChangeWorkspaceOwnerPage';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {addSubscriptionPaymentCard} from '@userActions/PaymentMethods';
import {
    checkBulkTransferPolicyBillingOwner,
    clearWorkspaceOwnerChangeFlow,
    queueBulkTransferPolicyBillingOwner,
    requestWorkspaceOwnerChange,
    skipBulkTransferPolicyBillingOwnerCheck,
} from '@userActions/Policy/Member';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import {createOwnedPaidAdminPolicyIDsSelector} from '@selectors/Policy';
import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';

import type {PaymentCardData} from './WorkspaceOwnerPaymentCardForm';

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
    const [ownerPolicyIDs = getEmptyArray<string>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: createOwnedPaidAdminPolicyIDsSelector(policy?.ownerAccountID)});
    const otherOwnerPolicyIDs = ownerPolicyIDs.filter((ownerPolicyID) => ownerPolicyID !== policyID);
    const [billingTakeoverPolicies] = useOnyx(ONYXKEYS.BILLING_TAKEOVER_POLICIES);
    const {isOffline} = useNetwork();

    // Tags this visit's check, so an answer an earlier visit left in Onyx is never read
    const [checkID, setCheckID] = useState(rand64);
    const isCheckAnswered = billingTakeoverPolicies?.checkID === checkID && !billingTakeoverPolicies?.isLoading;
    const transferablePolicyIDs = isCheckAnswered ? (billingTakeoverPolicies?.policyIDs ?? getEmptyArray<string>()) : getEmptyArray<string>();
    const shouldOfferAllWorkspaces = transferablePolicyIDs.includes(policyID) && transferablePolicyIDs.length > 1;
    const subscriptionTransfer = transferablePolicyIDs.map((transferablePolicyID) => billingTakeoverPolicies?.subscriptionTransfers?.[transferablePolicyID]).find((transfer) => !!transfer);
    const [hasPickedThisWorkspace, setHasPickedThisWorkspace] = useState(false);
    const [isTakingOverAllWorkspaces, setIsTakingOverAllWorkspaces] = useState(false);
    const isCheckingTransferablePolicies = otherOwnerPolicyIDs.length > 0 && !isCheckAnswered;
    const shouldShowAllWorkspacesCheck = shouldOfferAllWorkspaces && !hasPickedThisWorkspace && !policy?.errorFields?.changeOwner;
    const shouldTakeOverThisWorkspaceOnly = otherOwnerPolicyIDs.length === 0 || (isCheckAnswered && !shouldOfferAllWorkspaces);

    // Once a saved card lets the user take over all of the owner's workspaces, the question replaces the card form
    const shouldShowPaymentCardForm = isAuthRequired || (error === CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD && !isCheckingTransferablePolicies && !shouldShowAllWorkspacesCheck);
    const startedCheckIDRef = useRef<string | undefined>(undefined);
    const hasRequestedOwnerChangeRef = useRef(false);

    // An earlier transfer's result stays on the policy until this visit's request starts loading
    const hasTransferStartedLoadingRef = useRef(false);

    useNavigateToCardAuthenticationOnLink();

    const requestThisWorkspaceOwnerChange = () => {
        hasRequestedOwnerChangeRef.current = true;
        requestWorkspaceOwnerChange(policy, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');
    };

    const takeOverThisWorkspace = () => {
        setHasPickedThisWorkspace(true);
        requestThisWorkspaceOwnerChange();
    };

    // The check fails without a billing card, so it runs again once the card is saved
    const addPaymentCardAndCheckAllWorkspaces = (cardData: PaymentCardData) => {
        const newCheckID = rand64();
        setCheckID(newCheckID);
        startedCheckIDRef.current = newCheckID;
        hasRequestedOwnerChangeRef.current = false;
        clearWorkspaceOwnerChangeFlow(policyID);
        addSubscriptionPaymentCard(currentUserPersonalDetails.accountID, cardData, fundList, route.name);
        checkBulkTransferPolicyBillingOwner([policyID, ...otherOwnerPolicyIDs], newCheckID);
    };

    // The transfer always ends on the success or error page, so keep loading until one of them opens
    const takeOverAllWorkspaces = () => {
        setIsTakingOverAllWorkspaces(true);
        queueBulkTransferPolicyBillingOwner(policyID, transferablePolicyIDs, !!subscriptionTransfer);
    };

    useEffect(() => {
        if (isLoadingPolicy || otherOwnerPolicyIDs.length === 0 || isCheckAnswered) {
            return;
        }

        // The check can't answer offline, so the transfer continues with this workspace only
        if (isOffline) {
            skipBulkTransferPolicyBillingOwnerCheck(checkID);
            return;
        }
        if (startedCheckIDRef.current === checkID) {
            return;
        }
        startedCheckIDRef.current = checkID;
        checkBulkTransferPolicyBillingOwner([policyID, ...otherOwnerPolicyIDs], checkID);
    }, [checkID, isCheckAnswered, isLoadingPolicy, isOffline, otherOwnerPolicyIDs, policyID]);

    useEffect(() => {
        if (isLoadingPolicy || !shouldTakeOverThisWorkspaceOnly || hasRequestedOwnerChangeRef.current) {
            return;
        }
        requestThisWorkspaceOwnerChange();
    }, [isLoadingPolicy, requestThisWorkspaceOwnerChange, shouldTakeOverThisWorkspaceOnly]);

    useEffect(() => {
        if (!policy) {
            return;
        }
        if (policy.isLoading) {
            hasTransferStartedLoadingRef.current = true;
            return;
        }
        if (!hasTransferStartedLoadingRef.current) {
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

    const isLoading = isLoadingPolicy || !!policy?.isLoading || isCheckingTransferablePolicies || isTakingOverAllWorkspaces;

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
                    {shouldShowPaymentCardForm && (
                        <WorkspaceOwnerPaymentCardForm
                            policy={policy}
                            onAddPaymentCard={otherOwnerPolicyIDs.length > 0 ? addPaymentCardAndCheckAllWorkspaces : undefined}
                        />
                    )}
                    {!isLoading && !shouldShowPaymentCardForm && shouldShowAllWorkspacesCheck && (
                        <WorkspaceOwnerChangeAllWorkspacesCheck
                            policy={policy}
                            policyIDs={transferablePolicyIDs}
                            subscriptionTransfer={subscriptionTransfer}
                            onTakeOverAllWorkspaces={takeOverAllWorkspaces}
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
