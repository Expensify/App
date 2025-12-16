import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineSyncClasses, updateQuickbooksOnlineSyncCustomers, updateQuickbooksOnlineSyncLocations} from '@libs/actions/connections/QuickbooksOnline';
import {updateXeroMappings} from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canModifyPlan, getDefaultApprover, getPerDiemCustomUnit, isControlPolicy} from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {enablePerDiem} from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import {
    enableAutoApprovalOptions,
    enableCompanyCards,
    enablePolicyAutoReimbursementLimit,
    enablePolicyReportFields,
    enablePolicyRules,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
    setWorkspaceApprovalMode,
    upgradeToCorporate,
} from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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

    const featureNameAlias = route.params?.featureName && getFeatureNameAlias(route.params.featureName);

    const feature = useMemo(
        () =>
            Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING)
                .filter((value) => value.id !== CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.id)
                .find((f) => f.alias === featureNameAlias),
        [featureNameAlias],
    );
    const {translate} = useLocalize();
    const {accountID} = useCurrentUserPersonalDetails();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: true});
    const ownerPoliciesSelectorWithAccountID = useCallback((policies: OnyxCollection<Policy>) => ownerPoliciesSelector(policies, accountID), [accountID]);
    const [ownerPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false, selector: ownerPoliciesSelectorWithAccountID});
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {isOffline} = useNetwork();

    const canPerformUpgrade = useMemo(() => canModifyPlan(ownerPolicies, policy), [ownerPolicies, policy]);
    const isUpgraded = useMemo(() => isControlPolicy(policy), [policy]);

    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    const categoryId = route.params?.categoryId;

    const defaultApprover = getDefaultApprover(policy);

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
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID, ROUTES.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)));
                return;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                return Navigation.goBack(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
            default:
                return route.params.backTo ? Navigation.goBack(route.params.backTo) : Navigation.goBack();
        }
    }, [feature, policyID, route.params?.backTo, route.params?.featureName, featureNameAlias]);

    const onUpgradeToCorporate = () => {
        if (!canPerformUpgrade || !policy) {
            return;
        }

        upgradeToCorporate(policy.id, feature?.name);
    };

    const confirmUpgrade = useCallback(() => {
        if (!policyID) {
            return;
        }
        if (!feature) {
            if (featureNameAlias === CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias) {
                setPolicyPreventMemberCreatedTitle(policyID, true);
            }
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.preventSelfApproval.id:
                setPolicyPreventSelfApproval(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoApproveCompliantReports.id:
                enableAutoApprovalOptions(policyID, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoPayApprovedReports.id:
                enablePolicyAutoReimbursementLimit(policyID, true);
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
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
                enablePolicyRules(policyID, true, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                enableCompanyCards(policyID, true, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                enablePerDiem(policyID, true, perDiemCustomUnit?.customUnitID, false);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id:
                setWorkspaceApprovalMode(policyID, defaultApprover, CONST.POLICY.APPROVAL_MODE.ADVANCED);
                break;
            default:
        }
    }, [
        categoryId,
        feature,
        perDiemCustomUnit?.customUnitID,
        policy?.connections?.xero?.config,
        policy?.connections?.xero?.data,
        policyID,
        qboConfig?.syncClasses,
        qboConfig?.syncCustomers,
        qboConfig?.syncLocations,
        route.params?.featureName,
        featureNameAlias,
        defaultApprover,
    ]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (!isUpgraded || !canPerformUpgrade) {
                    return;
                }
                confirmUpgrade();
            };
        }, [isUpgraded, canPerformUpgrade, confirmUpgrade]),
    );

    if (!canPerformUpgrade) {
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
                    />
                )}
                {!isUpgraded && (
                    <UpgradeIntro
                        policyID={policyID}
                        feature={feature}
                        onUpgrade={onUpgradeToCorporate}
                        buttonDisabled={isOffline}
                        loading={policy?.isPendingUpgrade}
                        backTo={route.params.backTo}
                    />
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

export default WorkspaceUpgradePage;
