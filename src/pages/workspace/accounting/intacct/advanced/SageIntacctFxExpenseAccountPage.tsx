import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';

import useIsGlobalReimbursementFXEnabled from '@hooks/useIsGlobalReimbursementFXEnabled';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctExpenseAccounts, settingsPendingAction} from '@libs/PolicyUtils';

import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import variables from '@styles/variables';

import {updateSageIntacctFxExpenseAccount} from '@userActions/connections/SageIntacct';
import {clearSageIntacctErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

function SageIntacctFxExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const isGlobalReimbursementFXEnabled = useIsGlobalReimbursementFXEnabled();

    const policyID = policy?.id ?? CONST.DEFAULT_NUMBER_ID.toString();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const {config} = policy?.connections?.intacct ?? {};
    const {syncReimbursedReports} = config?.sync ?? {};
    const fxExpenseAccount = config?.fxExpenseAccount;
    const expenseAccountOptions = useMemo<SelectorType[]>(() => getSageIntacctExpenseAccounts(policy, fxExpenseAccount), [policy, fxExpenseAccount]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.fxExpenseAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const updateAccount = useCallback(
        ({value}: SelectorType) => {
            updateSageIntacctFxExpenseAccount(policyID, value, fxExpenseAccount);
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
        },
        [policyID, fxExpenseAccount],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={illustrations.Telescope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.sageIntacct.noAccountsFound')}
                subtitle={translate('workspace.sageIntacct.noAccountsFoundDescription')}
                containerStyle={styles.pb10}
            />
        ),
        [illustrations.Telescope, translate, styles.pb10],
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctFxExpenseAccountPage"
            data={expenseAccountOptions}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            shouldBeBlocked={!syncReimbursedReports || !isGlobalReimbursementFXEnabled}
            onSelectRow={updateAccount}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={expenseAccountOptions.find((mode) => mode.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID))}
            title="workspace.sageIntacct.fxExpenseAccount"
            listEmptyContent={listEmptyContent}
            pendingAction={settingsPendingAction([CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT], config?.pendingFields)}
            errors={getLatestErrorField(config ?? {}, CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT)}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={() => clearSageIntacctErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.FX_EXPENSE_ACCOUNT)}
        />
    );
}

export default withPolicyConnections(SageIntacctFxExpenseAccountPage);
