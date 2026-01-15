import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctBankAccounts, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateSageIntacctSyncReimbursementAccountID} from '@userActions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();

    const {config} = policy?.connections?.intacct ?? {};
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const vendorSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctBankAccounts(policy, config?.sync?.reimbursementAccountID), [policy, config?.sync?.reimbursementAccountID]);

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (value !== config?.sync?.reimbursementAccountID) {
                updateSageIntacctSyncReimbursementAccountID(policyID, value, config?.sync?.reimbursementAccountID);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
        },
        [policyID, config?.sync?.reimbursementAccountID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.sageIntacct.noAccountsFound')}
                subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
            />
        ),
        [illustrations.Telescope, translate],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctPaymentAccountPage"
            data={vendorSelectorOptions ?? []}
            listItem={RadioListItem}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={vendorSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID))}
            title="workspace.sageIntacct.paymentAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID)}
        />
    );
}

export default withPolicyConnections(SageIntacctPaymentAccountPage);
