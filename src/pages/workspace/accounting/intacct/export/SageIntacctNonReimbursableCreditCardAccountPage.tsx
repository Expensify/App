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
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctCreditCards} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctNonReimbursableCreditCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const {nonReimbursableAccount} = policy?.connections?.intacct?.config.export ?? {};

    const vendorSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctCreditCards(policy, nonReimbursableAccount), [nonReimbursableAccount, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.creditCardAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (value !== nonReimbursableAccount) {
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, CONST.XERO_CONFIG.EXPORT, {
                    nonReimbursableAccount: value,
                });
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID));
        },
        [policyID, nonReimbursableAccount],
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
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={SageIntacctNonReimbursableCreditCardAccountPage.displayName}
            sections={vendorSelectorOptions.length ? [{data: vendorSelectorOptions}] : []}
            listItem={RadioListItem}
            onSelectRow={updateDefaultVendor}
            initiallyFocusedOptionKey={vendorSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
            headerContent={listHeaderComponent}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID))}
            title="workspace.sageIntacct.creditCardAccount"
            listEmptyContent={listEmptyContent}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        />
    );
}

SageIntacctNonReimbursableCreditCardAccountPage.displayName = 'PolicySageIntacctNonReimbursableCreditCardAccountPage';

export default withPolicyConnections(SageIntacctNonReimbursableCreditCardAccountPage);
