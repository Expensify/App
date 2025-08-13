import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSageIntacctAutoSync} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

type SageIntacctAutoSyncPageRouteParams = {
    backTo?: Route;
};

function SageIntacctAutoSyncPage({policy, route}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const config = policy?.connections?.intacct?.config;
    const {autoSync, pendingFields} = config ?? {};
    const {backTo} = route.params as SageIntacctAutoSyncPageRouteParams;
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const pendingAction = settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC], pendingFields) ?? settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.ACCOUNTING_METHOD], pendingFields);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
    }, [policyID, backTo]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                style={[styles.defaultModalContainer]}
                testID={SageIntacctAutoSyncPage.displayName}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('common.settings')}
                    onBackButtonPress={goBack}
                />
                <ToggleSettingOptionRow
                    key={translate('workspace.sageIntacct.autoSync')}
                    title={translate('workspace.sageIntacct.autoSync')}
                    subtitle={translate('workspace.sageIntacct.autoSyncDescription')}
                    switchAccessibilityLabel={translate('workspace.sageIntacct.autoSyncDescription')}
                    isActive={!!autoSync?.enabled}
                    wrapperStyle={[styles.pv2, styles.mh5]}
                    shouldPlaceSubtitleBelowSwitch
                    onToggle={() =>updateSageIntacctAutoSync(policyID, !autoSync?.enabled)}
                    pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED], pendingFields)}
                    errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED)}
                    onCloseError={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED)}
                />
                {!!autoSync?.enabled && (
                    <OfflineWithFeedback pendingAction={pendingAction}>
                        <MenuItemWithTopDescription
                            title={
                                accountingMethod === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL
                                    ? translate(`workspace.sageIntacct.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL}` as TranslationPaths)
                                    : translate(`workspace.sageIntacct.accountingMethods.values.${COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths)
                            }
                            description={translate('workspace.sageIntacct.accountingMethods.label')}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD.getRoute(policyID, backTo))}
                        />
                    </OfflineWithFeedback>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

SageIntacctAutoSyncPage.displayName = 'SageIntacctAutoSyncPage';

export default withPolicyConnections(SageIntacctAutoSyncPage);