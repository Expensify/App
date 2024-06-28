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
import {getSageIntacctBankAccounts} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import {updateSageIntacctSyncReimbursedReports, updateSageIntacctSyncReimbursementAccountID} from '@userActions/connections/SageIntacct';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SageIntacctPaymentAccountPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';

    const {sync} = policy?.connections?.intacct?.config ?? {};

    const vendorSelectorOptions = useMemo<SelectorType[]>(() => getSageIntacctBankAccounts(policy, sync?.reimbursementAccountID), [policy, sync?.reimbursementAccountID]);

    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.sageIntacct.paymentAccountDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const updateDefaultVendor = useCallback(
        ({value}: SelectorType) => {
            if (value !== sync?.reimbursementAccountID) {
                updateSageIntacctSyncReimbursementAccountID(policyID, value);
                updateSageIntacctSyncReimbursedReports(policyID, value);
            }
            Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID));
        },
        [policyID, sync?.reimbursementAccountID],
    );

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TeleScope}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workspace.common.noAccountsFound')}
                subtitle={translate('workspace.common.noAccountsFoundDescription', CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT)}
            />
        ),
        [translate],
    );

    return (
        <OfflineWithFeedback
            errors={ErrorUtils.getLatestErrorField(sync ?? {}, CONST.SAGE_INTACCT_CONFIG.REIMBUSERED_ACCOUNT_ID)}
            errorRowStyles={[styles.ph5, styles.mt2]}
            onClose={() => Policy.clearSageIntacctSyncErrorField(policyID, CONST.SAGE_INTACCT_CONFIG.REIMBUSERED_ACCOUNT_ID)}
        >
            <SelectionScreen
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                displayName={SageIntacctPaymentAccountPage.displayName}
                sections={vendorSelectorOptions.length ? [{data: vendorSelectorOptions}] : []}
                listItem={RadioListItem}
                onSelectRow={updateDefaultVendor}
                initiallyFocusedOptionKey={vendorSelectorOptions.find((mode) => mode.isSelected)?.keyForList}
                headerContent={listHeaderComponent}
                onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID))}
                title="workspace.sageIntacct.paymentAccount"
                listEmptyContent={listEmptyContent}
                connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
            />
        </OfflineWithFeedback>
    );
}

SageIntacctPaymentAccountPage.displayName = 'PolicySageIntacctPaymentAccountPage';

export default withPolicyConnections(SageIntacctPaymentAccountPage);
