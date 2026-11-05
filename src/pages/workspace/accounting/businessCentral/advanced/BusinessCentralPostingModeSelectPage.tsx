import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBusinessCentralErrorField, updateBusinessCentralPostingMode} from '@libs/actions/connections/BusinessCentral';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {BusinessCentralExport} from '@src/types/onyx/Policy';

import React from 'react';
import {View} from 'react-native';

type PostingModeListItem = ListItem & {
    value: BusinessCentralExport['postingMode'];
};

function BusinessCentralPostingModeSelectPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const businessCentralConfig = policy?.connections?.businessCentral?.config;
    const postingMode = businessCentralConfig?.export?.postingMode ?? CONST.BUSINESS_CENTRAL_POSTING_MODE.CREATE_AND_POST;
    const backPath = policyID ? ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_ADVANCED.getRoute(policyID) : undefined;

    const data: PostingModeListItem[] = [CONST.BUSINESS_CENTRAL_POSTING_MODE.CREATE_AND_POST, CONST.BUSINESS_CENTRAL_POSTING_MODE.CREATE_ONLY].map((postingModeItem) => ({
        value: postingModeItem,
        text: translate(`workspace.businessCentral.advanced.postingMode.values.${postingModeItem}.label`),
        alternateText: translate(`workspace.businessCentral.advanced.postingMode.values.${postingModeItem}.description`),
        keyForList: postingModeItem,
        isSelected: postingMode === postingModeItem,
    }));

    const headerContent = (
        <View style={[styles.ph5, styles.pb5]}>
            <Text style={styles.pb2}>{translate('workspace.businessCentral.advanced.postingMode.description')}</Text>
            <Text style={styles.mutedTextLabel}>{translate('workspace.businessCentral.advanced.postingMode.note')}</Text>
        </View>
    );

    const selectPostingMode = (item: PostingModeListItem) => {
        if (item.value !== postingMode && policyID) {
            updateBusinessCentralPostingMode(policyID, item.value, postingMode);
        }
        Navigation.goBack(backPath);
    };

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="BusinessCentralPostingModeSelectPage"
            title="workspace.businessCentral.advanced.postingMode.label"
            data={data}
            headerContent={headerContent}
            onSelectRow={selectPostingMode}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={postingMode}
            onBackButtonPress={() => Navigation.goBack(backPath)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL}
            pendingAction={settingsPendingAction([CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE], businessCentralConfig?.pendingFields)}
            errors={getLatestErrorField(businessCentralConfig, CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => policyID && clearBusinessCentralErrorField(policyID, CONST.BUSINESS_CENTRAL_CONFIG.POSTING_MODE)}
        />
    );
}

export default withPolicyConnections(BusinessCentralPostingModeSelectPage);
