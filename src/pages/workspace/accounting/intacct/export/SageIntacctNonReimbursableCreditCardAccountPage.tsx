import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSageIntacctCreditCards} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateSageIntacctExportNonReimbursableAccount} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctNonReimbursableCreditCardAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};

    const creditCardSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount), [exportConfig?.nonReimbursableAccount, policy]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.creditCardAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const updateCreditCardAccount = useCallback(
        ({value}: SelectorType) => {
            if (value !== exportConfig?.nonReimbursableAccount) {
                updateSageIntacctExportNonReimbursableAccount(policyID, value);
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
                title={translate('workspace.common.noAccountsFound')}
                subtitle={translate('workspace.common.noAccountsFoundDescription', CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT)}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.pb10],
    );

    return (
        <OfflineWithFeedback
            errors={ErrorUtils.getLatestErrorField(exportConfig ?? {}, 'nonReimbursableAccount')}
            errorRowStyles={[styles.ph5, styles.mt2]}
            onClose={() => Policy.clearSageIntacctExportErrorField(policyID, 'nonReimbursableAccount')}
        >
            <SelectionScreen
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                displayName={SageIntacctNonReimbursableCreditCardAccountPage.displayName}
                sections={creditCardSelectorOptions.length ? [{data: creditCardSelectorOptions}] : []}
                listItem={RadioListItem}
                onSelectRow={updateCreditCardAccount}
                initiallyFocusedOptionKey={creditCardSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
                headerContent={listHeaderComponent}
                onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID))}
                title="workspace.sageIntacct.creditCardAccount"
                listEmptyContent={listEmptyContent}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            />
        </OfflineWithFeedback>
    );
}

SageIntacctNonReimbursableCreditCardAccountPage.displayName = 'PolicySageIntacctNonReimbursableCreditCardAccountPage';

export default withPolicyConnections(SageIntacctNonReimbursableCreditCardAccountPage);
