import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as Xero from '@libs/actions/connections/Xero';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import * as PerDiem from '@userActions/Policy/PerDiem';
import CONST from '@src/CONST';
import * as Policy from '@src/libs/actions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
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
    const policyID = route.params.policyID;

    const featureNameAlias = route.params.featureName && getFeatureNameAlias(route.params.featureName);

    const feature = useMemo(() => Object.values(CONST.UPGRADE_FEATURE_INTRO_MAPPING).find((f) => f.alias === featureNameAlias), [featureNameAlias]);
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {isOffline} = useNetwork();

    const canPerformUpgrade = !!policy && PolicyUtils.isPolicyAdmin(policy);
    const isUpgraded = useMemo(() => PolicyUtils.isControlPolicy(policy), [policy]);

    const perDiemCustomUnit = PolicyUtils.getPerDiemCustomUnit(policy);
    const categoryId = route.params?.categoryId;

    const goBack = useCallback(() => {
        if (!feature) {
            Navigation.dismissModal();
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id:
                Navigation.goBack();
                if (route.params.backTo) {
                    Navigation.navigate(route.params.backTo);
                }
                return;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias:
                        Navigation.dismissModal();
                        return Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
                    default: {
                        Navigation.goBack();
                        if (route.params.backTo) {
                            Navigation.navigate(route.params.backTo);
                        }
                        return;
                    }
                }
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                Navigation.dismissModal();
                return Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID));
            default:
                Navigation.dismissModal();
                return route.params.backTo ? Navigation.navigate(route.params.backTo) : Navigation.goBack();
        }
    }, [feature, policyID, route.params.backTo, route.params.featureName]);

    const upgradeToCorporate = () => {
        if (!canPerformUpgrade) {
            return;
        }

        Policy.upgradeToCorporate(policy.id, feature?.name);
    };

    const confirmUpgrade = useCallback(() => {
        if (!feature) {
            return;
        }
        switch (feature.id) {
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.id:
                switch (route.params.featureName) {
                    case CONST.REPORT_FIELDS_FEATURE.qbo.classes:
                        QuickbooksOnline.updateQuickbooksOnlineSyncClasses(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncClasses);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.qbo.customers:
                        QuickbooksOnline.updateQuickbooksOnlineSyncCustomers(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncCustomers);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.qbo.locations:
                        QuickbooksOnline.updateQuickbooksOnlineSyncLocations(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncLocations);
                        break;
                    case CONST.REPORT_FIELDS_FEATURE.xero.mapping: {
                        const {trackingCategories} = policy?.connections?.xero?.data ?? {};
                        const currentTrackingCategory = trackingCategories?.find((category) => category.id === categoryId);
                        const {mappings} = policy?.connections?.xero?.config ?? {};
                        const currentTrackingCategoryValue = currentTrackingCategory ? mappings?.[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${currentTrackingCategory.id}`] ?? '' : '';
                        Xero.updateXeroMappings(
                            policyID,
                            categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD} : {},
                            categoryId ? {[`${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${categoryId}`]: currentTrackingCategoryValue} : {},
                        );
                        break;
                    }
                    default: {
                        Policy.enablePolicyReportFields(policyID, true, true);
                    }
                }
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.rules.id:
                Policy.enablePolicyRules(policyID, true, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.id:
                Policy.enableCompanyCards(policyID, true, true);
                break;
            case CONST.UPGRADE_FEATURE_INTRO_MAPPING.perDiem.id:
                PerDiem.enablePerDiem(policyID, true, perDiemCustomUnit?.customUnitID, true);
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
        route.params.featureName,
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
            {isUpgraded && (
                <UpgradeConfirmation
                    onConfirmUpgrade={goBack}
                    policyName={policy.name}
                />
            )}
            {!isUpgraded && (
                <UpgradeIntro
                    feature={feature}
                    onUpgrade={upgradeToCorporate}
                    buttonDisabled={isOffline}
                    loading={policy.isPendingUpgrade}
                />
            )}
        </ScreenWrapper>
    );
}

export default WorkspaceUpgradePage;
