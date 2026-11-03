import BlockingView from '@components/BlockingViews/BlockingView';
import type {ListItem} from '@components/SelectionList/types';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineCollectionAccountID} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {settingsPendingAction} from '@libs/PolicyUtils';

import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type SelectorType = ListItem & {
    value: string;
};

function QuickbooksInvoiceAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const {bankAccounts, otherCurrentAssetAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const accountOptions = [...(bankAccounts ?? []), ...(otherCurrentAssetAccounts ?? [])];
    const qboConfig = policy?.connections?.quickbooksOnline?.config;

    const qboOnlineSelectorOptions: SelectorType[] = accountOptions?.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: qboConfig?.collectionAccountID === id,
    }));

    const listHeaderComponent = (
        <View style={[styles.pb2, styles.ph5]}>
            <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.invoiceAccountSelectorDescription', integrationName)}</Text>
        </View>
    );

    const initiallyFocusedOptionKey = qboOnlineSelectorOptions?.find((mode) => mode.isSelected)?.keyForList;

    const updateAccount = ({value}: SelectorType) => {
        updateQuickbooksOnlineCollectionAccountID(policyID, value, qboConfig?.collectionAccountID);
        Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID));
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.qbo.noAccountsFound')}
            subtitle={translate('workspace.qbo.noAccountsFoundDescription', integrationName)}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="QuickbooksInvoiceAccountSelectPage"
            data={qboOnlineSelectorOptions}
            headerContent={listHeaderComponent}
            onSelectRow={updateAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            listEmptyContent={listEmptyContent}
            title="workspace.qbo.advancedConfig.qboInvoiceCollectionAccount"
            headerTitleAlreadyTranslated={translate('workspace.qbo.advancedConfig.qboInvoiceCollectionAccount', integrationName)}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID))}
            pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID], qboConfig?.pendingFields)}
            errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.mv3]}
            onClose={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(QuickbooksInvoiceAccountSelectPage);
