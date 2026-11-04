import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateNetSuiteApprovalAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteApprovalAccountOptions} from '@libs/NetSuiteUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function NetSuiteApprovalAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id;

    const config = policy?.connections?.netsuite?.options.config;
    const netsuiteApprovalAccountOptions: SelectorType[] = getNetSuiteApprovalAccountOptions(policy ?? undefined, config?.approvalAccount, translate);

    const initiallyFocusedOptionKey = netsuiteApprovalAccountOptions?.find((mode) => mode.isSelected)?.keyForList;

    const updateCollectionAccount = ({value}: SelectorType) => {
        if (config?.approvalAccount !== value && policyID) {
            updateNetSuiteApprovalAccount(policyID, value, config?.approvalAccount ?? CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT);
        }
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.netsuite.noAccountsFound')}
            subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    const headerContent = (
        <View>
            <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.approvalAccountDescription')}</Text>
        </View>
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteApprovalAccountSelectPage"
            headerContent={headerContent}
            titleNumberOfLines={2}
            data={netsuiteApprovalAccountOptions}
            onSelectRow={updateCollectionAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.approvalAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteApprovalAccountSelectPage);
