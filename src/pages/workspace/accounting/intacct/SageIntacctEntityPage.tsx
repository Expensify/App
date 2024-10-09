import React from 'react';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField, updateSageIntacctEntity} from '@libs/actions/connections/SageIntacct';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

function SageIntacctEntityPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const config = policy?.connections?.intacct?.config;
    const entityID = config?.entity ?? '';
    const {translate} = useLocalize();

    const policyID = policy?.id;

    const sections = [
        {
            text: translate('workspace.common.topLevel'),
            value: translate('workspace.common.topLevel'),
            keyForList: '',
            isSelected: entityID === '',
        },
    ];
    policy?.connections?.intacct?.data?.entities.forEach((entity) => {
        sections.push({
            text: entity.name,
            value: entity.name,
            keyForList: entity.id,
            isSelected: entity.id === entityID,
        });
    });

    const saveSelection = ({keyForList}: ListItem) => {
        updateSageIntacctEntity(policyID, keyForList ?? '', entityID);
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
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.ENTITY], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
            errorRowStyles={[styles.ph5, styles.mv2]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
        />
    );
}

SageIntacctEntityPage.displayName = 'SageIntacctEntityPage';

export default withPolicy(SageIntacctEntityPage);
