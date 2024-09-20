import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections/NetSuiteCommands';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getNetSuiteInvoiceItemOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteInvoiceItemSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const config = policy?.connections?.netsuite.options.config;
    const netsuiteInvoiceItemOptions = useMemo<SelectorType[]>(() => getNetSuiteInvoiceItemOptions(policy ?? undefined, config?.invoiceItem), [config?.invoiceItem, policy]);

    const initiallyFocusedOptionKey = useMemo(() => netsuiteInvoiceItemOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteInvoiceItemOptions]);

    const updateInvoiceItem = useCallback(
        ({value}: SelectorType) => {
            if (config?.invoiceItem !== value) {
                Connections.updateNetSuiteInvoiceItem(policyID, value, config?.invoiceItem);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID));
        },
        [policyID, config?.invoiceItem],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noItemsFound')}
                subtitle={translate('workspace.netsuite.noItemsFoundDescription')}
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
            displayName={NetSuiteInvoiceItemSelectPage.displayName}
            sections={netsuiteInvoiceItemOptions.length ? [{data: netsuiteInvoiceItemOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateInvoiceItem}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT.getRoute(policyID))}
            title="workspace.netsuite.invoiceItem.label"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={config?.invoiceItemPreference !== CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.INVOICE_ITEM], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.INVOICE_ITEM)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.INVOICE_ITEM)}
        />
    );
}

NetSuiteInvoiceItemSelectPage.displayName = 'NetSuiteInvoiceItemSelectPage';

export default withPolicyConnections(NetSuiteInvoiceItemSelectPage);
