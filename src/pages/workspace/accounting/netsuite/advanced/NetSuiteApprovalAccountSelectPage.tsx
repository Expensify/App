import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteApprovalAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteApprovalAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const config = policy?.connections?.netsuite.options.config;
    const netsuiteApprovalAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteApprovalAccountOptions(policy ?? undefined, config?.approvalAccount),
        // The default option will be language dependent, so we need to recompute the options when the language changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [config?.approvalAccount, policy, translate],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteApprovalAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteApprovalAccountOptions]);

    const updateCollectionAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.approvalAccount !== value) {
                Connections.updateNetSuiteApprovalAccount(policyID, value, config?.approvalAccount ?? CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.approvalAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    const headerContent = useMemo(
        () => (
            <View>
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.approvalAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteApprovalAccountSelectPage.displayName}
            headerContent={headerContent}
            sections={netsuiteApprovalAccountOptions.length ? [{data: netsuiteApprovalAccountOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateCollectionAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.approvalAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.APPROVAL_ACCOUNT)}
        />
    );
}

NetSuiteApprovalAccountSelectPage.displayName = 'NetSuiteApprovalAccountSelectPage';

export default withPolicyConnections(NetSuiteApprovalAccountSelectPage);
