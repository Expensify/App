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
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getXeroBankAccounts, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function XeroInvoiceAccountSelectorPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const {config} = policy?.connections?.xero ?? {};
    const {invoiceCollectionsAccountID, syncReimbursedReports} = policy?.connections?.xero?.config.sync ?? {};
    const xeroSelectorOptions = useMemo<SelectorType[]>(() => getXeroBankAccounts(policy ?? undefined, invoiceCollectionsAccountID), [invoiceCollectionsAccountID, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.xero.advancedConfig.invoiceAccountSelectorDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => xeroSelectorOptions?.find((mode) => mode.isSelected)?.keyForList, [xeroSelectorOptions]);

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            Connections.updatePolicyXeroConnectionConfig(
                policyID,
                CONST.POLICY.CONNECTIONS.NAME.XERO,
                CONST.XERO_CONFIG.SYNC,
                {
                    invoiceCollectionsAccountID: value,
                },
                {invoiceCollectionsAccountID: invoiceCollectionsAccountID ?? null},
            );
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID));
        },
        [policyID, invoiceCollectionsAccountID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.xero.noAccountsFound')}
                subtitle={translate('workspace.xero.noAccountsFoundDescription')}
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
            displayName={XeroInvoiceAccountSelectorPage.displayName}
            sections={xeroSelectorOptions.length ? [{data: xeroSelectorOptions}] : []}
            listItem={RadioListItem}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            shouldBeBlocked={!syncReimbursedReports}
            onSelectRow={updateAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID))}
            title="workspace.xero.advancedConfig.xeroInvoiceCollectionAccount"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID)}
        />
    );
}

XeroInvoiceAccountSelectorPage.displayName = 'XeroInvoiceAccountSelectorPage';

export default withPolicyConnections(XeroInvoiceAccountSelectorPage);
