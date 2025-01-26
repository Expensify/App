import React, {useCallback} from 'react';
import type {TupleToUnion} from 'type-fest';
import RadioListItem from '@components/SelectionList/RadioListItem';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNSQSCustomersMapping} from '@libs/actions/connections/NSQS';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {clearNSQSErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const Options = [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG, CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] as const;
type Option = TupleToUnion<typeof Options>;

function NSQSCustomersDisplayedAsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const importType = nsqsConfig?.syncOptions.mapping.customers ?? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    const sectionData: Array<SelectorType<Option>> = Options.map((option) => ({
        keyForList: option,
        text: translate(`workspace.nsqs.import.importTypes.${option}.label`),
        alternateText: translate(`workspace.nsqs.import.importTypes.${option}.description`),
        isSelected: option === importType,
        value: option,
    }));

    const updateImportMapping = useCallback(
        ({value: mapping}: SelectorType<Option>) => {
            if (!policyID) {
                return;
            }

            if (mapping !== importType) {
                updateNSQSCustomersMapping(policyID, mapping, importType);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_CUSTOMERS.getRoute(policyID));
        },
        [policyID, importType],
    );

    return (
        <SelectionScreen<Option>
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NSQSCustomersDisplayedAsPage.displayName}
            sections={[{data: sectionData}]}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onSelectRow={updateImportMapping}
            initiallyFocusedOptionKey={sectionData.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={policyID ? () => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_CUSTOMERS.getRoute(policyID)) : undefined}
            title="workspace.common.displayedAs"
            pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.pendingFields)}
            errors={getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={policyID ? () => clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS) : undefined}
        />
    );
}

NSQSCustomersDisplayedAsPage.displayName = 'NSQSCustomersDisplayedAsPage';

export default withPolicyConnections(NSQSCustomersDisplayedAsPage);
