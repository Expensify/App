import GovernmentRateCountryRadioButtons from '@components/GovernmentRateCountryRadioButtons';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import WorkspaceConfirmationForm from '@components/WorkspaceConfirmationForm';
import type {WorkspaceConfirmationSubmitFunctionParams} from '@components/WorkspaceConfirmationForm';

import useActivePolicy from '@hooks/useActivePolicy';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useHasActiveAdminPolicies from '@hooks/useHasActiveAdminPolicies';
import useHasOwnedPaidPolicy from '@hooks/useHasOwnedPaidPolicy';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {createWorkspaceWithPolicyDraftAndNavigateToIt} from '@libs/actions/App';
import {setWorkspaceDistanceAutoUpdate} from '@libs/actions/Policy/DistanceRate';
import getCurrentUrl from '@libs/Navigation/currentUrl';
import Navigation from '@libs/Navigation/Navigation';
import {isSubscriptionTypeOfInvoicing} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {LastPaymentMethodType} from '@src/types/onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

function DynamicWorkspaceConfirmationPage() {
    // It is necessary to use here isSmallScreenWidth because on a wide layout we should always navigate to ROUTES.WORKSPACE_OVERVIEW.
    // shouldUseNarrowLayout cannot be used to determine that as this screen is displayed in RHP and shouldUseNarrowLayout always returns true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_CONFIRMATION.path);
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const delegateAccountID = useDelegateAccountID();
    const privateSubscription = usePrivateSubscription();
    const isAnnualSubscription = privateSubscription?.type === CONST.SUBSCRIPTION.TYPE.ANNUAL;
    const activePolicy = useActivePolicy();
    const hasActiveAdminPolicies = useHasActiveAdminPolicies();
    const hasOwnedPaidPolicy = useHasOwnedPaidPolicy();

    // On narrow layout the new workspace is mounted under this RHP and revealed when the modal
    // dismisses (via revealRouteBeforeDismissingModal). The reveal waits for the new screen to lay
    // out before sliding the RHP out, so we show a spinner on the Confirm button as immediate
    // feedback. It clears when this page unmounts together with the RHP.
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const pendingGovernmentRateCountry = useRef<string | undefined>(undefined);

    const createWorkspace = (params: WorkspaceConfirmationSubmitFunctionParams, governmentRateCountry?: string) => {
        // policyID is always supplied by WorkspaceConfirmationForm (stable per form instance).
        const policyID = params.policyID;
        const isDifferentOwner = !!params.owner?.email && params.owner.email !== (currentUserPersonalDetails.email ?? '');
        const shouldShowSuccessPage = isDifferentOwner && !params.makeMeAdmin;
        const workspaceRoute = isSmallScreenWidth ? ROUTES.WORKSPACE_INITIAL.getRoute(policyID) : ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID);
        const routeToNavigate = shouldShowSuccessPage ? ROUTES.WORKSPACE_CONFIRMATION_SUCCESS : workspaceRoute;
        if (!shouldShowSuccessPage && isSmallScreenWidth) {
            setIsCreatingWorkspace(true);
        }
        createWorkspaceWithPolicyDraftAndNavigateToIt({
            introSelected,
            policyOwner: params.owner,
            policyName: params.name,
            transitionFromOldDot: false,
            makeMeAdmin: params.makeMeAdmin,
            backTo: '',
            policyID,
            currency: params.currency,
            file: params.avatarFile as File,
            routeToNavigateAfterCreate: routeToNavigate,
            lastUsedPaymentMethod: lastPaymentMethod?.[policyID] as LastPaymentMethodType,
            activePolicy,
            conciergeChat,
            currentUserAccountIDParam: currentUserPersonalDetails.accountID,
            currentUserEmailParam: currentUserPersonalDetails.email ?? '',
            shouldCreateControlPolicy: isSubscriptionTypeOfInvoicing(privateSubscription?.type),
            shouldEnableDistanceRates: !!governmentRateCountry,
            type: params.planType,
            isSelfTourViewed,
            betas,
            hasActiveAdminPolicies,
            hasOwnedPaidPolicy,
            isAnnualSubscription,
            delegateAccountID,
        });

        // The creation write replaces the whole policy in Onyx, so the country is enabled only after it lands
        if (governmentRateCountry) {
            Navigation.isNavigationReady().then(() => {
                setWorkspaceDistanceAutoUpdate(policyID, undefined, true, [], CONST.CURRENCY.EUR, governmentRateCountry);
            });
        }
    };

    const onSubmit = (params: WorkspaceConfirmationSubmitFunctionParams) => {
        const shouldCreateControlPolicy = isSubscriptionTypeOfInvoicing(privateSubscription?.type);
        const workspaceType = params.planType ?? (shouldCreateControlPolicy || isAnnualSubscription ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM);

        // Several supported countries share EUR, so a new Control workspace on EUR picks its government rate country first
        if (params.currency === CONST.CURRENCY.EUR && workspaceType === CONST.POLICY.TYPE.CORPORATE) {
            pendingGovernmentRateCountry.current = undefined;
            showConfirmModal({
                title: translate('workspace.distanceRates.autoUpdateGovernmentRate'),
                prompt: (
                    <View>
                        <Text style={[styles.textNormal, styles.mb3]}>{translate('workspace.distanceRates.governmentRateCountryCreationPrompt')}</Text>
                        <GovernmentRateCountryRadioButtons
                            onSelect={(countryCode) => {
                                pendingGovernmentRateCountry.current = countryCode;
                            }}
                        />
                    </View>
                ),
                confirmText: translate('common.confirm'),
                cancelText: translate('common.cancel'),
                shouldShowCancelButton: true,
            }).then((result) => {
                const countryCode = pendingGovernmentRateCountry.current;
                pendingGovernmentRateCountry.current = undefined;
                if (result.action !== ModalActions.CONFIRM || !countryCode) {
                    createWorkspace(params);
                    return;
                }
                createWorkspace(params, countryCode);
            });
            return;
        }

        createWorkspace(params);
    };
    const currentUrl = getCurrentUrl();
    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = currentUrl ? (new URL(currentUrl).searchParams.get('ownerEmail') ?? '') : '';

    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight
            testID="DynamicWorkspaceConfirmationPage"
        >
            <WorkspaceConfirmationForm
                policyOwnerEmail={policyOwnerEmail}
                onSubmit={onSubmit}
                isLoading={isCreatingWorkspace}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
        </ScreenWrapper>
    );
}

export default DynamicWorkspaceConfirmationPage;
