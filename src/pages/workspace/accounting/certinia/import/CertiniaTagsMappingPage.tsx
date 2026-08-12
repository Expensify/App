import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearFinancialForceErrorField, updateFinancialForceParentTagMapping} from '@libs/actions/connections/FinancialForce';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {CertiniaParentTagMapping} from '@pages/workspace/accounting/certinia/utils';
import {getParentTagMappingLabel} from '@pages/workspace/accounting/certinia/utils';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type TagsMappingListItem = ListItem & {
    value: CertiniaParentTagMapping;
};

const PARENT_TAG_MAPPING_OPTIONS: CertiniaParentTagMapping[] = [
    CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS_AND_ASSIGNMENTS,
    CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS,
    CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_ASSIGNMENTS,
];

function CertiniaTagsMappingPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const config = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config;
    const currentValue = config?.coding?.parentTagMapping;
    const selectedValue = currentValue ?? CONST.CERTINIA_PARENT_TAG_MAPPING.PARENT_TAG_PROJECTS_AND_ASSIGNMENTS;

    const data: TagsMappingListItem[] = PARENT_TAG_MAPPING_OPTIONS.map((mappingValue) => ({
        text: getParentTagMappingLabel(mappingValue, translate),
        keyForList: mappingValue,
        isSelected: selectedValue === mappingValue,
        value: mappingValue,
    }));

    const updateMapping = ({value}: TagsMappingListItem) => {
        if (policyID && value !== selectedValue) {
            updateFinancialForceParentTagMapping(policyID, value, currentValue ?? null);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID));
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="CertiniaTagsMappingPage"
            data={data}
            shouldBeBlocked={!config?.hasPSA}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.CERTINIA}
            onSelectRow={updateMapping}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((option) => option.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_CERTINIA_IMPORT.getRoute(policyID))}
            title="workspace.certinia.import.tagsMappedTo"
            pendingAction={settingsPendingAction([CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearFinancialForceErrorField(policyID, CONST.CERTINIA_CONFIG.PARENT_TAG_MAPPING)}
        />
    );
}

CertiniaTagsMappingPage.displayName = 'CertiniaTagsMappingPage';

export default withPolicyConnections(CertiniaTagsMappingPage);
