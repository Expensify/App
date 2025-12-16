import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctBillable} from '@libs/actions/connections/SageIntacct';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getCurrentSageIntacctEntityName, settingsPendingAction} from '@libs/PolicyUtils';
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
    config?.mappings?.dimensions?.some((dimension) => !!config?.errorFields?.[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimension.dimension}`]);

const checkForUserDimensionWithPendingAction = (config?: SageIntacctConnectionsConfig) =>
    config?.mappings?.dimensions?.some((dimension) => !!config?.pendingFields?.[`${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimension.dimension}`]);

function SageIntacctImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id;
    const sageIntacctConfig = policy?.connections?.intacct?.config;
    const sageIntacctData = policy?.connections?.intacct?.data;

    const mappingItems = useMemo(
        () =>
            Object.values(CONST.SAGE_INTACCT_CONFIG.MAPPINGS).map((mapping) => {
                const menuItemTitleKey = getDisplayTypeTranslationKey(sageIntacctConfig?.mappings?.[mapping]);
                return {
                    description: Str.recapitalize(translate('workspace.intacct.mappingTitle', {mappingName: mapping})),
                    action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping)),
                    title: menuItemTitleKey ? translate(menuItemTitleKey) : undefined,
                    subscribedSettings: [mapping],
                };
            }),
        [policyID, sageIntacctConfig?.mappings, translate],
    );

    const isExpenseType = sageIntacctConfig?.export.reimbursable === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT;

    return (
        <ConnectionLayout
            displayName="SageIntacctImportPage"
            headerTitle="workspace.accounting.import"
            headerSubtitle={getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel'))}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <ToggleSettingOptionRow
                title={translate(isExpenseType ? 'workspace.intacct.expenseTypes' : 'workspace.accounting.accounts')}
                subtitle={translate(isExpenseType ? 'workspace.intacct.expenseTypesDescription' : 'workspace.intacct.accountTypesDescription')}
                switchAccessibilityLabel={translate(isExpenseType ? 'workspace.intacct.expenseTypesDescription' : 'workspace.intacct.accountTypesDescription')}
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
                pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS], sageIntacctConfig?.pendingFields)}
                errors={getLatestErrorField(sageIntacctConfig ?? {}, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS)}
                onCloseError={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS)}
            />

            {mappingItems.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={settingsPendingAction(section.subscribedSettings, sageIntacctConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={areSettingsInErrorFields(section.subscribedSettings, sageIntacctConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}

            {!!sageIntacctData?.taxSolutionIDs && sageIntacctData?.taxSolutionIDs?.length > 0 && (
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.TAX, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={
                            sageIntacctConfig?.tax?.syncTax ? sageIntacctConfig?.tax?.taxSolutionID || sageIntacctData?.taxSolutionIDs?.at(0) : translate('workspace.accounting.notImported')
                        }
                        description={translate('common.tax')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.SAGE_INTACCT_CONFIG.TAX, CONST.SAGE_INTACCT_CONFIG.TAX_SOLUTION_ID], sageIntacctConfig?.errorFields)
                                ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}

            <OfflineWithFeedback pendingAction={checkForUserDimensionWithPendingAction(sageIntacctConfig) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined}>
                <MenuItemWithTopDescription
                    title={
                        sageIntacctConfig?.mappings?.dimensions && sageIntacctConfig?.mappings?.dimensions?.length > 0
                            ? translate('workspace.intacct.userDimensionsAdded', {count: sageIntacctConfig?.mappings?.dimensions?.length})
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

export default withPolicy(SageIntacctImportPage);
