import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctCreditCards, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateSageIntacctNonreimbursableExpensesExportAccount} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctNonReimbursableCreditCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};

    const creditCardSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount), [exportConfig?.nonReimbursableAccount, policy]);

    const updateCreditCardAccount = useCallback(
        ({value}: SelectorType) => {
            if (value !== exportConfig?.nonReimbursableAccount) {
                updateSageIntacctNonreimbursableExpensesExportAccount(policyID, value, exportConfig?.nonReimbursableAccount);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID));
        },
        [policyID, exportConfig?.nonReimbursableAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.sageIntacct.noAccountsFound')}
                subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctNonReimbursableCreditCardAccountPage.displayName}
            sections={creditCardSelectorOptions.length ? [{data: creditCardSelectorOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateCreditCardAccount}
            initiallyFocusedOptionKey={creditCardSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID))}
            title="workspace.sageIntacct.creditCardAccount"
            listEmptyContent={listEmptyContent}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT], config?.pendingFields)}
            errors={ErrorUtils.getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => Policy.clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

SageIntacctNonReimbursableCreditCardAccountPage.displayName = 'SageIntacctNonReimbursableCreditCardAccountPage';

export default withPolicyConnections(SageIntacctNonReimbursableCreditCardAccountPage);
