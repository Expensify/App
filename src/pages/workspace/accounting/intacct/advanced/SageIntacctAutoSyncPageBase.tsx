import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSageIntacctAutoSync} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

type SageIntacctAutoSyncPageBaseParams = {
    policy: OnyxEntry<Policy>;
    navigateBackTo?: Route;
};

function SageIntacctAutoSyncPageBase({policy, navigateBackTo}: SageIntacctAutoSyncPageBaseParams) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = policy?.id;
    const config = policy?.connections?.intacct?.config;
    const {autoSync, pendingFields} = config ?? {};
    const accountingMethod = config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
    const pendingAction = settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC], pendingFields) ?? settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.ACCOUNTING_METHOD], pendingFields);

    const goBack = useCallback(() => {
        Navigation.goBack(navigateBackTo ?? ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
    }, [navigateBackTo, policyID]);

    return (
        <ConnectionLayout
            displayName={SageIntacctAutoSyncPageBase.displayName}
            headerTitle="common.settings"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            onBackButtonPress={goBack}
            shouldBeBlocked={false}
        >
            <ToggleSettingOptionRow
                key={translate('workspace.sageIntacct.autoSync')}
                title={translate('workspace.sageIntacct.autoSync')}
                subtitle={translate('workspace.sageIntacct.autoSyncDescription')}
                switchAccessibilityLabel={translate('workspace.sageIntacct.autoSyncDescription')}
                isActive={!!autoSync?.enabled}
                wrapperStyle={[styles.pv2, styles.mh5]}
                shouldPlaceSubtitleBelowSwitch
                onToggle={() => updateSageIntacctAutoSync(policyID, !autoSync?.enabled)}
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
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD.getRoute(policyID))}
                    />
                </OfflineWithFeedback>
            )}
        </ConnectionLayout>
    );
}

SageIntacctAutoSyncPageBase.displayName = 'SageIntacctAutoSyncPageBase';

export default SageIntacctAutoSyncPageBase;
