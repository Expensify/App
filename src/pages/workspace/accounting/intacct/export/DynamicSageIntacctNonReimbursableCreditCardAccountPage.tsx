import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctCreditCards, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {updateSageIntacctNonreimbursableExpensesExportAccount} from '@userActions/connections/SageIntacct';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

import React from 'react';

function DynamicSageIntacctNonReimbursableCreditCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT.path);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const goBack = () => {
        Navigation.goBack(backPath);
    };

    const creditCardSelectorOptions: SelectorType[] = getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount);

    const updateCreditCardAccount = ({value}: SelectorType) => {
        if (value !== exportConfig?.nonReimbursableAccount && policyID) {
            updateSageIntacctNonreimbursableExpensesExportAccount(policyID, value, exportConfig?.nonReimbursableAccount);
        }
        goBack();
    };

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate('workspace.sageIntacct.noAccountsFound')}
            subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctNonReimbursableCreditCardAccountPage"
            data={creditCardSelectorOptions ?? []}
            onSelectRow={updateCreditCardAccount}
            initiallyFocusedOptionKey={creditCardSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            onBackButtonPress={goBack}
            title="workspace.sageIntacct.creditCardAccount"
            listEmptyContent={listEmptyContent}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(DynamicSageIntacctNonReimbursableCreditCardAccountPage);
