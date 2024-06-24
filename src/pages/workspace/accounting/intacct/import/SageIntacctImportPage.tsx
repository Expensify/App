import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {getCurrentXeroOrganizationName} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SageIntacctMappingName, SageIntacctMappingValue} from '@src/types/onyx/Policy';

function getDisplayTypeTranslationKey(displayType?: SageIntacctMappingValue): TranslationPaths | undefined {
    switch (displayType) {
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.DEFAULT: {
            return 'workspace.intacct.employeeDefault';
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.TAG: {
            return 'workspace.accounting.importTypes.TAG';
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.REPORT_FIELD: {
            return 'workspace.accounting.importTypes.REPORT_FIELD';
        }
        case CONST.SAGE_INTACCT_CONFIG.MAPPING_VALUE.NONE: {
            return undefined;
        }
        default: {
            return undefined;
        }
    }
}

function SageIntacctImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '-1';
    const sageIntacctConfig = policy?.connections?.intacct?.config;

    const currentXeroOrganizationName = useMemo(() => getCurrentXeroOrganizationName(policy ?? undefined), [policy]);

    const mapingItems = useMemo(
        () =>
            Object.values(CONST.SAGE_INTACCT_CONFIG.MAPPINGS).map((mapping: SageIntacctMappingName) => {
                const menuItemTitleKey = getDisplayTypeTranslationKey(sageIntacctConfig?.mappings?.[mapping]);
                return {
                    description: translate('workspace.common.mappingTitle', mapping, true),
                    action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS.getRoute(policyID, mapping)),
                    title: menuItemTitleKey ? translate(menuItemTitleKey) : undefined,
                    hasError: !!sageIntacctConfig?.mappings?.errorFields?.[mapping],
                    pendingAction: sageIntacctConfig?.mappings?.pendingFields?.[mapping],
                };
            }),
        [policyID, sageIntacctConfig?.mappings, translate],
    );

    return (
        <ConnectionLayout
            displayName={SageIntacctImportPage.displayName}
            headerTitle="workspace.accounting.import"
            headerSubtitle={currentXeroOrganizationName}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Expense types"
                subtitle="Sage Intacct expense types import into Expensify as categories."
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
                disabled
            />
            <ToggleSettingOptionRow
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Billable"
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
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
                // key={translate('workspace.xero.advancedConfig.autoSync')}
                title="Tax"
                subtitle="Import purchase tax rate from Sage Intacct."
                switchAccessibilityLabel={translate('workspace.xero.advancedConfig.autoSyncDescription')} // todoson
                shouldPlaceSubtitleBelowSwitch
                wrapperStyle={[styles.mv3, styles.mh5]}
                isActive
                onToggle={() => {}}
            />
            <OfflineWithFeedback
            // key={section.description}
            // pendingAction={section.pendingAction}
            >
                <MenuItemWithTopDescription
                    description="User-defined dimensions"
                    shouldShowRightIcon
                    onPress={() => {}}
                    // brickRoadIndicator={section.hasError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

SageIntacctImportPage.displayName = 'PolicySageIntacctImportPage';

export default withPolicy(SageIntacctImportPage);
