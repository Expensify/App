import {useRoute} from '@react-navigation/native';
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
import {getNetSuiteVendorOptions} from '@libs/PolicyUtils';
import type {ExpenseRouteParams} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteExportExpensesVendorSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite.options.config;
    const netsuiteVendorOptions = useMemo<SelectorType[]>(() => getNetSuiteVendorOptions(policy ?? undefined, config?.defaultVendor), [config?.defaultVendor, policy]);

    const initiallyFocusedOptionKey = useMemo(() => netsuiteVendorOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteVendorOptions]);

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (config?.defaultVendor !== value) {
                Connections.updateNetSuiteDefaultVendor(policyID, value, config?.defaultVendor);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType));
        },
        [config?.defaultVendor, policyID, params.expenseType],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noVendorsFound')}
                subtitle={translate('workspace.netsuite.noVendorsFoundDescription')}
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
            displayName={NetSuiteExportExpensesVendorSelectPage.displayName}
            sections={netsuiteVendorOptions.length ? [{data: netsuiteVendorOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES.getRoute(policyID, params.expenseType))}
            title="workspace.accounting.defaultVendor"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={isReimbursable || config?.nonreimbursableExpensesExportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL}
        />
    );
}

NetSuiteExportExpensesVendorSelectPage.displayName = 'NetSuiteExportExpensesVendorSelectPage';

export default withPolicyConnections(NetSuiteExportExpensesVendorSelectPage);
