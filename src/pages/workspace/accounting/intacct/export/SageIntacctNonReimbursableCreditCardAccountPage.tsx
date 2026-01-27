import {useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearSageIntacctErrorField} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSageIntacctCreditCards, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateSageIntacctNonreimbursableExpensesExportAccount} from '@userActions/connections/SageIntacct';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function SageIntacctNonReimbursableCreditCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const {config} = policy?.connections?.intacct ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT>>();
    const backTo = route.params.backTo;
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const goBack = useCallback(() => {
        Navigation.goBack(backTo ?? (policyID && ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID)));
    }, [backTo, policyID]);

    const creditCardSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount), [exportConfig?.nonReimbursableAccount, policy]);

    const updateCreditCardAccount = useCallback(
        ({value}: SelectorType) => {
            if (value !== exportConfig?.nonReimbursableAccount && policyID) {
                updateSageIntacctNonreimbursableExpensesExportAccount(policyID, value, exportConfig?.nonReimbursableAccount);
            }
            goBack();
        },
        [policyID, exportConfig?.nonReimbursableAccount, goBack],
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
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName="SageIntacctNonReimbursableCreditCardAccountPage"
            data={creditCardSelectorOptions ?? []}
            listItem={RadioListItem}
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

export default withPolicyConnections(SageIntacctNonReimbursableCreditCardAccountPage);
