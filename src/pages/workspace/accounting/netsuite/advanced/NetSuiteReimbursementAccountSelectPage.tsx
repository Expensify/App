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
import {getNetSuiteReimbursableAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteReimbursementAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const config = policy?.connections?.netsuite.options.config;
    const netsuiteReimbursableAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteReimbursableAccountOptions(policy ?? undefined, config?.reimbursementAccountID),
        [config?.reimbursementAccountID, policy],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteReimbursableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteReimbursableAccountOptions]);

    const updateReimbursementAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.reimbursementAccountID !== value) {
                Connections.updateNetSuiteReimbursementAccountID(policyID, value, config?.reimbursementAccountID);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.reimbursementAccountID],
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
                <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.netsuite.advancedConfig.reimbursementsAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb5, styles.ph5],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteReimbursementAccountSelectPage.displayName}
            headerContent={headerContent}
            sections={netsuiteReimbursableAccountOptions.length ? [{data: netsuiteReimbursableAccountOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateReimbursementAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID))}
            title="workspace.netsuite.advancedConfig.reimbursementsAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={config?.reimbursableExpensesExportDestination === CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
        />
    );
}

NetSuiteReimbursementAccountSelectPage.displayName = 'NetSuiteReimbursementAccountSelectPage';

export default withPolicyConnections(NetSuiteReimbursementAccountSelectPage);
