import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyData from '@hooks/usePolicyData';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineSyncClasses, updateQuickbooksOnlineSyncCustomers, updateQuickbooksOnlineSyncLocations} from '@libs/actions/connections/QuickbooksOnline';
import {updateXeroMappings} from '@libs/actions/connections/Xero';
import {enablePolicyTravel} from '@libs/actions/Policy/Travel';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    canAccessSubmitWorkspaceFeatures as canAccessSubmitWorkspaceFeaturesUtils,
    canEditWorkspaceSettings,
    canModifyPlan,
    getDefaultApprover,
    getPerDiemCustomUnit,
    getUserFriendlyWorkspaceType,
    isControlPolicy,
    isPaidGroupPolicy,
} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {enablePerDiem} from '@userActions/Policy/PerDiem';
import CONST, {SUBMIT_FEATURE_IDS} from '@src/CONST';
import {
    enableAutoApprovalOptions,
    enableCompanyCards,
    enableExpensifyCard,
    enablePolicyAutoReimbursementLimit,
    enablePolicyConnections,
    enablePolicyHR,
    enablePolicyInvoiceFields,
    enablePolicyInvoicing,
    enablePolicyReportFields,
    enablePolicyRules,
    isCurrencySupportedForDirectReimbursement,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
    setWorkspaceApprovalMode,
    setWorkspaceReimbursement,
    upgradeSubmit,
    upgradeToCorporate,
} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {ownerPoliciesSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import UpgradeConfirmation from './UpgradeConfirmation';
import UpgradeIntro from './UpgradeIntro';

type WorkspaceUpgradePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.UPGRADE>;

function getFeatureNameAlias(featureName: string) {
    switch (featureName) {
        case CONST.REPORT_FIELDS_FEATURE.qbo.classes:
        case CONST.REPORT_FIELDS_FEATURE.qbo.customers:
        case CONST.REPORT_FIELDS_FEATURE.qbo.locations:
        case CONST.REPORT_FIELDS_FEATURE.xero.mapping:
            return CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias;
        default: {
            return featureName;
        }
    }
}

function WorkspaceUpgradePage({route}: WorkspaceUpgradePageProps) {
    const styles = useThemeStyles();
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const {isBetaEnabled} = usePermissions();
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const canAccessSubmitWorkspaceFeatures = canAccessSubmitWorkspaceFeaturesUtils(policy, isSubmit2026BetaEnabled);
    const featureNameAlias = route.params?.featureName && getFeatureNameAlias(route.params.featureName);
    const [upgradingFromSubmit, setUpgradingFromSubmit] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- snapshot is workspace-scoped; clear when route policyID changes
        setUpgradingFromSubmit(undefined);
    }, [policyID]);

    useEffect(() => {
        if (!policy?.type) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- latch once when policy loads; functional update preserves sticky value across upgrades
        setUpgradingFromSubmit((previous) => (previous !== undefined ? previous : canAccessSubmitWorkspaceFeatures));
    }, [policy?.type, policyID, canAccessSubmitWorkspaceFeatures]);

    const feature = featureNameAlias
        ? Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
              .filter((value) => value.id !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id)
              .find((f) => f.alias === featureNameAlias)
        : undefined;

    const isUpgraded = !!policy?.type && upgradingFromSubmit !== undefined && (isControlPolicy(policy) || !!(upgradingFromSubmit && isPaidGroupPolicy(policy)));
    const {translate} = useLocalize();
    const {accountID, email = ''} = useCurrentUserPersonalDetails();
    const [priorFirstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [priorLastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);

    const ownerPoliciesSelectorWithAccountID = useCallback((policies: OnyxCollection<Policy>) => ownerPoliciesSelector(policies, accountID), [accountID]);
    const [ownerPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: ownerPoliciesSelectorWithAccountID});
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {isOffline} = useNetwork();
    const canPerformUpgrade = canModifyPlan(ownerPolicies, policy) || canAccessSubmitWorkspaceFeatures;
    const policyData = usePolicyData(policyID);
    const policyDataRef = useRef(policyData);

    useEffect(() => {
        policyDataRef.current = policyData;
    });

    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const categoryId = route.params?.categoryId;

    const defaultApprover = getDefaultApprover(policy);

    // useCallback is needed here because goBack is passed as a prop to child components;
    // the rule flags it because the deps could be inlined, but removing useCallback would cause unnecessary re-renders.
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const goBack = useCallback(() => {
        if ((!feature && featureNameAlias !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias) || !policyID) {
            Navigation.dismissModal();
            return;
        }
        switch (feature?.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id:
                Navigation.goBack();
                if (route.params.backTo) {
                    Navigation.navigate(route.params.backTo);
                }
                return;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias:
                        return Navigation.goBack(ROUTES.WORKSPACE_REPORTS.getRoute(policyID));
                    default: {
                        Navigation.goBack();
                        if (route.params.backTo) {
                            Navigation.navigate(route.params.backTo);
                        }
                        return;
                    }
                }
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoiceFields.id:
                return Navigation.goBack(ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.path, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)));
                return;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoicing.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCardSubmit.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.travelSubmit.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.hr.id:
                return Navigation.goBack(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
            default:
                return route.params.backTo ? Navigation.goBack(route.params.backTo) : Navigation.goBack();
        }
    }, [feature, policyID, route.params?.backTo, route.params?.featureName, featureNameAlias]);

    const onUpgradeToCorporate = () => {
        if (!canPerformUpgrade || !policy) {
            return;
        }

        if (canAccessSubmitWorkspaceFeatures) {
            const targetType = (feature && 'requiredPlan' in feature ? feature.requiredPlan : undefined) ?? CONST.POLICY.TYPE.TEAM;
            upgradeSubmit(policy, targetType, email, accountID, priorFirstDayFreeTrial, priorLastDayFreeTrial);
            return;
        }

        upgradeToCorporate(policy, feature?.name);
    };

    // useCallback is needed here because confirmUpgrade is passed as a prop to child components;
    // the rule flags it because the deps could be inlined, but removing useCallback would cause unnecessary re-renders.

    const confirmUpgrade = useCallback(() => {
        if (!policyID) {
            return;
        }
        if (!feature) {
            if (featureNameAlias === CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias) {
                setPolicyPreventMemberCreatedTitle(policyID, true, policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]);
            }
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.preventSelfApproval.id:
                setPolicyPreventSelfApproval(policyID, true, policy?.preventSelfApproval);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoApproveCompliantReports.id:
                enableAutoApprovalOptions(policyID, true, policy?.shouldShowAutoApprovalOptions, policy?.autoApproval?.limit, policy?.autoApproval?.auditRate);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoPayApprovedReports.id:
                enablePolicyAutoReimbursementLimit(policyID, true, policy?.shouldShowAutoReimbursementLimitOption, policy?.autoReimbursement?.limit);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST.REPORT_FIELDS_FEATURE.qbo.classes:
                        updateQuickbooksOnlineSyncClasses(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncClasses);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.qbo.customers:
                        updateQuickbooksOnlineSyncCustomers(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncCustomers);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.qbo.locations:
                        updateQuickbooksOnlineSyncLocations(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncLocations);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.xero.mapping: {
                        const {trackingCategories} = policy?.connections?.xero?.data ?? {};
                        const currentTrackingCategory = trackingCategories?.find((category) => category.id === categoryId);
                        const {mappings} = policy?.connections?.xero?.config ?? {};
                        const currentTrackingCategoryValue = currentTrackingCategory ? (mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${currentTrackingCategory.id}`] ?? '') : '';
                        updateXeroMappings(
                            policyID,
                            categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD} : {},
                            categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: currentTrackingCategoryValue} : {},
                        );
                        break;
                    }
                    default: {
                        enablePolicyReportFields(policyID, true);
                    }
                }
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoiceFields.id:
                enablePolicyInvoiceFields(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
                enablePolicyRules(policy, true, false, policyDataRef.current);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCardSubmit.id:
                enableCompanyCards(policyID, true, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                enablePerDiem(policyID, true, perDiemCustomUnit?.customUnitID, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.hr.id:
                enablePolicyHR(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.id:
                setWorkspaceApprovalMode(policy, defaultApprover, CONST.POLICY.APPROVAL_MODE.ADVANCED, accountID, email);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.expensifyCard.id:
                enableExpensifyCard(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.payments.id: {
                let newReimbursementChoice;
                if (!!policy?.achAccount && !isCurrencySupportedForDirectReimbursement(policy?.outputCurrency ?? '')) {
                    newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                } else {
                    newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                }

                const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner;
                setWorkspaceReimbursement({
                    policyID,
                    currentAchAccount: policy?.achAccount,
                    currentReimbursementChoice: policy?.reimbursementChoice,
                    reimbursementChoice: newReimbursementChoice,
                    reimburserEmail: newReimburserEmail ?? '',
                    bankAccountID: policy?.achAccount?.bankAccountID,
                    accountNumber: policy?.achAccount?.accountNumber,
                    addressName: policy?.achAccount?.addressName,
                    bankName: policy?.achAccount?.bankName,
                    state: policy?.achAccount?.state,
                });
                break;
            }
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.accounting.id:
                enablePolicyConnections(policyID, true, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.travelSubmit.id:
                enablePolicyTravel(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoicing.id:
                enablePolicyInvoicing(policyID, true);
                break;
            default:
                break;
        }
    }, [
        policyID,
        feature,
        featureNameAlias,
        policy,
        route.params.featureName,
        perDiemCustomUnit?.customUnitID,
        defaultApprover,
        accountID,
        email,
        qboConfig?.syncClasses,
        qboConfig?.syncCustomers,
        qboConfig?.syncLocations,
        categoryId,
    ]);

    const confirmUpgradeOnBlurRef = useRef({isUpgraded, canPerformUpgrade, upgradingFromSubmit, featureID: feature?.id, confirmUpgrade});

    useEffect(() => {
        confirmUpgradeOnBlurRef.current = {isUpgraded, canPerformUpgrade, upgradingFromSubmit, featureID: feature?.id, confirmUpgrade};
    });

    useFocusEffect(
        useCallback(() => {
            return () => {
                const {
                    isUpgraded: wasUpgraded,
                    canPerformUpgrade: couldPerformUpgrade,
                    upgradingFromSubmit: wasUpgradingFromSubmit,
                    featureID,
                    confirmUpgrade: confirmUpgradeOnBlur,
                } = confirmUpgradeOnBlurRef.current;
                if (!wasUpgraded || !couldPerformUpgrade) {
                    return;
                }

                // UpgradeSubmit enables Collect-tier features on the backend; skip the redundant client-side enable.
                if (wasUpgradingFromSubmit && featureID && SUBMIT_FEATURE_IDS.has(featureID)) {
                    return;
                }

                confirmUpgradeOnBlur();
            };
        }, []),
    );

    // Editors can view the intro but only admins can upgrade, so we separate
    // access (canEditWorkspaceSettings) from the upgrade action (canPerformUpgrade).
    if (policy ? !canEditWorkspaceSettings(policy) : !canPerformUpgrade) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator
            testID="workspaceUpgradePage"
            offlineIndicatorStyle={styles.mtAuto}
            shouldShowOfflineIndicatorInWideScreen={!isUpgraded}
        >
            <HeaderWithBackButton
                title={translate('common.upgrade')}
                onBackButtonPress={() => {
                    if (isUpgraded) {
                        goBack();
                    } else {
                        Navigation.goBack();
                    }
                }}
            />
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                {!!policy && isUpgraded && (
                    <UpgradeConfirmation
                        afterUpgradeAcknowledged={goBack}
                        policyName={policy.name}
                        planName={getUserFriendlyWorkspaceType(policy.type, translate)}
                    />
                )}
                {!isUpgraded && (
                    <UpgradeIntro
                        policyID={policyID}
                        feature={feature}
                        onUpgrade={onUpgradeToCorporate}
                        buttonDisabled={isOffline || !canPerformUpgrade}
                        loading={policy?.isPendingUpgrade}
                        backTo={route.params.backTo}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceUpgradePage;
