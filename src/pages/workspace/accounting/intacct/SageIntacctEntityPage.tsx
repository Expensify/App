import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
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
            keyForList: entity.id,
            isSelected: entity.id === entityID,
        })) ?? [];

    const saveSelection = ({text, keyForList}: ListItem) => {
        if (!keyForList) {
            return;
        }

        updateSageIntacctEntity(policyID, text ?? '');
        Navigation.goBack();
    };

    return (
        <ConnectionLayout // switch to selection screen when https://github.com/Expensify/App/pull/44739 is merged
            displayName={SageIntacctEntityPage.displayName}
            headerTitle="workspace.intacct.entity"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            shouldIncludeSafeAreaPaddingBottom
            shouldUseScrollView={false}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <OfflineWithFeedback
                errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
                errorRowStyles={[styles.ph5, styles.mt2]}
                onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.ENTITY)}
            >
                <SelectionList
                    containerStyle={styles.pb0}
                    ListItem={RadioListItem}
                    onSelectRow={saveSelection}
                    shouldDebounceRowSelect
                    sections={[{data: sections}]}
                    initiallyFocusedOptionKey={entityID}
                />
            </OfflineWithFeedback>
        </ConnectionLayout>
    );
}

SageIntacctEntityPage.displayName = 'SageIntacctEntityPage';

export default withPolicy(SageIntacctEntityPage);
