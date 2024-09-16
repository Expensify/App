import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type SelectorType = ListItem & {
    value: string;
};

function QuickbooksInvoiceAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';
    const {bankAccounts, otherCurrentAssetAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const accountOptions = useMemo(() => [...(bankAccounts ?? []), ...(otherCurrentAssetAccounts ?? [])], [bankAccounts, otherCurrentAssetAccounts]);
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            accountOptions?.map(({id, name}) => ({
                value: id,
                text: name,
                keyForList: id,
                isSelected: qboConfig?.collectionAccountID === id,
            })),
        [qboConfig?.collectionAccountID, accountOptions],
    );

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.invoiceAccountSelectorDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => qboOnlineSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [qboOnlineSelectorOptions]);

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, value, qboConfig?.collectionAccountID);
            Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
        },
        [policyID, qboConfig?.collectionAccountID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.qbo.noAccountsFound')}
                subtitle={translate('workspace.qbo.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={QuickbooksInvoiceAccountSelectPage.displayName}
            sections={qboOnlineSelectorOptions.length ? [{data: qboOnlineSelectorOptions}] : []}
            listItem={RadioListItem}
            headerContent={listHeaderComponent}
            onSelectRow={updateAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            listEmptyContent={listEmptyContent}
            title="workspace.qbo.advancedConfig.qboInvoiceCollectionAccount"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID], qboConfig?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.mv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID)}
        />
    );
}

QuickbooksInvoiceAccountSelectPage.displayName = 'QuickbooksInvoiceAccountSelectPage';

export default withPolicyConnections(QuickbooksInvoiceAccountSelectPage);
