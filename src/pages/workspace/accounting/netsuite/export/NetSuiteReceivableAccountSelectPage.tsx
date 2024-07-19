import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteReceivableAccountOptions} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteReceivableAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const config = policy?.connections?.netsuite.options.config;
    const netsuiteReceivableAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteReceivableAccountOptions(policy ?? undefined, config?.receivableAccount),
        [config?.receivableAccount, policy],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteReceivableAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteReceivableAccountOptions]);

    const updateReceivableAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.receivableAccount !== value) {
                Connections.updateNetSuiteReceivableAccount(policyID, value, config?.receivableAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID));
        },
        [policyID, config?.receivableAccount],
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

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={NetSuiteReceivableAccountSelectPage.displayName}
            sections={netsuiteReceivableAccountOptions.length ? [{data: netsuiteReceivableAccountOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateReceivableAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
            title="workspace.netsuite.exportInvoices"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        />
    );
}

NetSuiteReceivableAccountSelectPage.displayName = 'NetSuiteReceivableAccountSelectPage';

export default withPolicyConnections(NetSuiteReceivableAccountSelectPage);
