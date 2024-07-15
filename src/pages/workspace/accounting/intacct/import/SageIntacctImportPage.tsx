import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctBillable, updateSageIntacctSyncTaxConfiguration} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentSageIntacctEntityName} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SageIntacctConnectionsConfig, SageIntacctMappingValue} from '@src/types/onyx/Policy';

function getDisplayTypeTranslationKey(displayType?: SageIntacctMappingValue): TranslationPaths | undefined {
    switch (displayType) {
        case CONST.SAGE_INTACCT_MAPPING_VALUE.DEFAULT: {
            return 'workspace.intacct.employeeDefault';
        }
        case CONST.SAGE_INTACCT_MAPPING_VALUE.TAG: {
            return 'workspace.accounting.importTypes.TAG';
        }
        case CONST.SAGE_INTACCT_MAPPING_VALUE.REPORT_FIELD: {
            return 'workspace.accounting.importTypes.REPORT_FIELD';
        }
        default: {
            return 'workspace.accounting.notImported';
        }
    }
}

const checkForUserDimensionWithError = (config?: SageIntacctConnectionsConfig) =>
    config?.mappings?.dimensions?.some((dimension) => !!config?.errorFields?.[`dimension_${dimension.dimension}`]);

const checkForUserDimensionWithPendingAction = (config?: SageIntacctConnectionsConfig) =>
    config?.mappings?.dimensions?.some((dimension) => !!config?.pendingFields?.[`dimension_${dimension.dimension}`]);

function SageIntacctImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID: string = policy?.id ?? '-1';
    const sageIntacctConfig = policy?.connections?.intacct?.config;

    const mapingItems = useMemo(
        () =>
            Object.values(CONST.SAGE_INTACCT_CONFIG.MAPPINGS).map((mapping) => {
                const menuItemTitleKey = getDisplayTypeTranslationKey(sageIntacctConfig?.mappings?.[mapping]);
                return {
                    description: Str.recapitalize(translate('workspace.intacct.mappingTitle', mapping)),
                    action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping)),
                    title: menuItemTitleKey ? translate(menuItemTitleKey) : undefined,
                    hasError: !!sageIntacctConfig?.errorFields?.[mapping],
                    pendingAction: sageIntacctConfig?.pendingFields?.[mapping],
                };
            }),
        [policyID, sageIntacctConfig?.errorFields, sageIntacctConfig?.mappings, sageIntacctConfig?.pendingFields, translate],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctImportPage.displayName}
            headerTitle="workspace.accounting.import"
            headerSubtitle={getCurrentSageIntacctEntityName(policy)}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.intacct.expenseTypes')}
                subtitle={translate('workspace.intacct.expenseTypesDescription')}
                switchAccessibilityLabel={translate('workspace.intacct.expenseTypesDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                title={translate('common.billable')}
                switchAccessibilityLabel={translate('common.billable')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={sageIntacctConfig?.mappings?.syncItems ?? false}
                onToggle={() => updateSageIntacctBillable(policyID, !sageIntacctConfig?.mappings?.syncItems)}
                pendingAction={sageIntacctConfig?.pendingFields?.syncItems}
                errors={ErrorUtils.getLatestErrorField(sageIntacctConfig ?? {}, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS)}
                onCloseError={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS)}
            />

            {mapingItems.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={section.pendingAction}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}

            <ToggleSettingOptionRow
                title={translate('common.tax')}
                subtitle={translate('workspace.intacct.importTaxDescription')}
                switchAccessibilityLabel={translate('workspace.intacct.importTaxDescription')}
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive={sageIntacctConfig?.tax?.syncTax ?? false}
                onToggle={() => updateSageIntacctSyncTaxConfiguration(policyID, !sageIntacctConfig?.tax?.syncTax)}
                pendingAction={sageIntacctConfig?.pendingFields?.tax}
                errors={ErrorUtils.getLatestErrorField(sageIntacctConfig ?? {}, CONST.SAGE_INTACCT_CONFIG.TAX)}
                onCloseError={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.TAX)}
            />

            <OfflineWithFeedback pendingAction={checkForUserDimensionWithPendingAction(sageIntacctConfig) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}>
                <MenuItemWithTopDescription
                    title={
                        sageIntacctConfig?.mappings?.dimensions && sageIntacctConfig?.mappings?.dimensions?.length > 0
                            ? translate('workspace.intacct.userDimensionsAdded', sageIntacctConfig?.mappings?.dimensions?.length)
                            : undefined
                    }
                    description={translate('workspace.intacct.userDefinedDimensions')}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS.getRoute(policyID))}
                    brickRoadIndicator={checkForUserDimensionWithError(sageIntacctConfig) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

SageIntacctImportPage.displayName = 'SageIntacctImportPage';

export default withPolicy(SageIntacctImportPage);
