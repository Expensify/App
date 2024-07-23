import React from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctEntity} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

function SageIntacctEntityPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const config = policy?.connections?.intacct?.config;
    const entityID = config?.entity ?? '';

    const policyID = policy?.id ?? '-1';

    const sections =
        policy?.connections?.intacct?.data?.entities.map((entity) => ({
            text: entity.name,
            value: entity.name,
            keyForList: entity.id,
            isSelected: entity.id === entityID,
        })) ?? [];

    const saveSelection = ({keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        updateSageIntacctEntity(policyID, keyForList ?? '');
        Navigation.goBack();
    };

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctEntityPage.displayName}
            sections={sections ? [{data: sections}] : []}
            listItem={RadioListItem}
            onSelectRow={saveSelection}
            initiallyFocusedOptionKey={sections?.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.dismissModal()}
            title="workspace.intacct.entity"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={config?.pendingFields?.entity}
            errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
            errorRowStyles={[styles.ph5, styles.mv2]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
        />
    );
}

SageIntacctEntityPage.displayName = 'SageIntacctEntityPage';

export default withPolicy(SageIntacctEntityPage);
