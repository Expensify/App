import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteTaxPostingAccount} from '@libs/actions/connections/NetSuiteCommands';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canUseTaxNetSuite, getNetSuiteTaxAccountOptions, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {clearNetSuiteErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteTaxPostingAccountSelectPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {isBetaEnabled} = usePermissions();

    const policyID = policy?.id;

    const config = policy?.connections?.netsuite?.options.config;
    const {subsidiaryList} = policy?.connections?.netsuite?.options?.data ?? {};
    const selectedSubsidiary = useMemo(() => (subsidiaryList ?? []).find((subsidiary) => subsidiary.internalID === config?.subsidiaryID), [subsidiaryList, config?.subsidiaryID]);

    const netsuiteTaxAccountOptions = useMemo<SelectorType[]>(
        () => getNetSuiteTaxAccountOptions(policy ?? undefined, selectedSubsidiary?.country, config?.taxPostingAccount),
        [config?.taxPostingAccount, policy, selectedSubsidiary?.country],
    );

    const initiallyFocusedOptionKey = useMemo(() => netsuiteTaxAccountOptions?.find((mode) => mode.isSelected)?.keyForList, [netsuiteTaxAccountOptions]);

    const updateTaxAccount = useCallback(
        ({value}: SelectorType) => {
            if (config?.taxPostingAccount !== value && policyID) {
                updateNetSuiteTaxPostingAccount(policyID, value, config?.taxPostingAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID));
        },
        [policyID, config?.taxPostingAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.netsuite.noAccountsFound')}
                subtitle={translate('workspace.netsuite.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="NetSuiteTaxPostingAccountSelectPage"
            data={netsuiteTaxAccountOptions}
            listItem={RadioListItem}
            onSelectRow={updateTaxAccount}
            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
            title="workspace.netsuite.journalEntriesTaxPostingAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            shouldBeBlocked={!!config?.suiteTaxEnabled || !config?.syncOptions.syncTax || !canUseTaxNetSuite(isBetaEnabled(CONST.BETAS.NETSUITE_USA_TAX), selectedSubsidiary?.country)}
            pendingAction={settingsPendingAction([CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(NetSuiteTaxPostingAccountSelectPage);
