import React, {useCallback} from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteCustomersJobsMapping} from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {NetSuiteMappingValues} from '@src/types/onyx/Policy';

type ImportListItem = SelectorType & {
    value: NetSuiteMappingValues;
};

function NetSuiteImportCustomersOrProjectSelectPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const netsuiteConfig = policy?.connections?.netsuite?.options?.config;
    const importMappings = netsuiteConfig?.syncOptions?.mapping;

    const importCustomer = importMappings?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importJobs = importMappings?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importedValue = importMappings?.customers !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;

    const inputOptions = [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD];

    const inputSectionData: ImportListItem[] = inputOptions.map((inputOption) => ({
        text: translate(`workspace.netsuite.import.importTypes.${inputOption}.label`),
        keyForList: inputOption,
        isSelected: importedValue === inputOption,
        value: inputOption,
        alternateText: translate(`workspace.netsuite.import.importTypes.${inputOption}.description`),
    }));

    const updateImportMapping = useCallback(
        ({value}: ImportListItem) => {
            if (value !== importedValue) {
                updateNetSuiteCustomersJobsMapping(
                    policyID,
                    {
                        customersMapping: importCustomer !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? value : CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
                        jobsMapping: importJobs !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? value : CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT,
                    },
                    {
                        customersMapping: importMappings?.customers,
                        jobsMapping: importMappings?.jobs,
                    },
                );
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID));
        },
        [importCustomer, importJobs, importMappings?.customers, importMappings?.jobs, importedValue, policyID],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteImportCustomersOrProjectSelectPage.displayName}
            sections={[{data: inputSectionData}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onSelectRow={(selection: SelectorType) => updateImportMapping(selection as ImportListItem)}
            initiallyFocusedOptionKey={inputSectionData.find((inputOption) => inputOption.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS.getRoute(policyID))}
            title="workspace.common.displayedAs"
            errors={
                areSettingsInErrorFields([CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS], netsuiteConfig?.errorFields)
                    ? ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS)
                    : ErrorUtils.getLatestErrorField(netsuiteConfig ?? {}, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS)
            }
            errorRowStyles={[styles.ph5, styles.pv3]}
            pendingAction={settingsPendingAction(
                [CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS],
                netsuiteConfig?.pendingFields,
            )}
            onClose={() => {
                Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.CUSTOMERS);
                Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.SYNC_OPTIONS.CUSTOMER_MAPPINGS.JOBS);
            }}
        />
    );
}

NetSuiteImportCustomersOrProjectSelectPage.displayName = 'NetSuiteImportCustomersOrProjectSelectPage';

export default withPolicyConnections(NetSuiteImportCustomersOrProjectSelectPage);
